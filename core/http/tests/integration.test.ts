/**
 * Integration tests for the HTTP server.
 *
 * These tests start the actual Hono app against an in-memory SQLite
 * database, make real HTTP requests, and verify the responses. They
 * prove the full stack works end-to-end: HTTP → middleware → core
 * operations → SQLite persistence → audit log.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { serve } from "@hono/node-server";
import type { ServerType } from "@hono/node-server";
import { openDatabase, createStores } from "@business-os/core/persistence-sqlite";
import { createApp } from "@business-os/core/http/server";
import type { DatabaseType } from "@business-os/core/persistence-sqlite";

let db: DatabaseType;
let server: ServerType;

function request(path: string, options: {
  method?: string;
  body?: unknown;
  token?: string;
  tenantSlug?: string;
} = {}): Promise<Response> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;
  if (options.tenantSlug) headers["X-Tenant-Slug"] = options.tenantSlug;
  return fetch(`http://localhost:3001${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
}

async function registerAndLogin(): Promise<{ token: string; userId: string }> {
  const email = `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@example.com`;
  const regRes = await request("/v1/identity/register", {
    method: "POST",
    body: { email, fullName: "Test User", password: "very-strong-password-123" },
  });
  const regJson = await regRes.json() as any;
  return { token: regJson.sessionToken, userId: regJson.user.id };
}

async function createOrg(token: string, slug: string): Promise<string> {
  const res = await request("/v1/organizations", {
    method: "POST",
    body: { name: `Org ${slug}`, slug, industry: "restaurants" },
    token,
  });
  const json = await res.json() as any;
  return json.organization.id;
}

beforeAll(() => {
  db = openDatabase({ path: ":memory:" });
  const stores = createStores(db);
  const app = createApp({
    identity: stores.identity,
    organizations: stores.organizations,
    authorization: stores.authorization,
    auditLog: stores.auditLog,
  });
  server = serve({ fetch: app.fetch, port: 3001 });
});

afterAll(() => {
  server.close();
  db.close();
});

describe("HTTP / health", () => {
  it("returns ok", async () => {
    const res = await request("/health");
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.ok).toBe(true);
  });
});

describe("HTTP / identity", () => {
  it("registers a new user and returns a session token", async () => {
    const res = await request("/v1/identity/register", {
      method: "POST",
      body: {
        email: `reg-${Date.now()}@example.com`,
        fullName: "Register Test",
        password: "very-strong-password-123",
      },
    });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.user.id).toMatch(/^usr_/);
    expect(json.sessionToken).toMatch(/^[\w-]+$/);
  });

  it("rejects duplicate emails", async () => {
    const email = `dup-${Date.now()}@example.com`;
    await request("/v1/identity/register", {
      method: "POST",
      body: { email, fullName: "Dup", password: "very-strong-password-123" },
    });
    const res = await request("/v1/identity/register", {
      method: "POST",
      body: { email, fullName: "Dup 2", password: "very-strong-password-123" },
    });
    expect(res.status).toBe(409);
    const json = await res.json() as any;
    expect(json.error.code).toBe("CONFLICT");
  });

  it("logs in with correct credentials", async () => {
    const { token } = await registerAndLogin();
    expect(token).toBeDefined();
  });

  it("rejects wrong password with generic error", async () => {
    const email = `wrong-${Date.now()}@example.com`;
    await request("/v1/identity/register", {
      method: "POST",
      body: { email, fullName: "Wrong", password: "very-strong-password-123" },
    });
    const res = await request("/v1/identity/login", {
      method: "POST",
      body: { email, password: "wrong-password-here" },
    });
    expect(res.status).toBe(400);
    const json = await res.json() as any;
    expect(json.error.message).toBe("invalid credentials");
  });

  it("returns 401 for /me without a token", async () => {
    const res = await request("/v1/identity/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for /me with a valid token", async () => {
    const { token } = await registerAndLogin();
    const res = await request("/v1/identity/me", { token });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.user.email).toBeDefined();
  });
});

describe("HTTP / organizations", () => {
  it("creates an org and makes the creator the owner", async () => {
    const { token } = await registerAndLogin();
    const slug = `org-${Date.now()}`;
    const res = await request("/v1/organizations", {
      method: "POST",
      body: { name: "Test Org", slug, industry: "retail" },
      token,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.organization.slug).toBe(slug);
    expect(json.membership.role).toBe("owner");
  });

  it("lists orgs the user belongs to", async () => {
    const { token } = await registerAndLogin();
    const slug = `list-${Date.now()}`;
    await createOrg(token, slug);
    const res = await request("/v1/organizations/mine", { token });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json).toHaveLength(1);
    expect(json[0].slug).toBe(slug);
  });

  it("requires authentication", async () => {
    const res = await request("/v1/organizations/mine");
    expect(res.status).toBe(401);
  });
});

describe("HTTP / authorization", () => {
  it("lists system roles for the tenant", async () => {
    const { token } = await registerAndLogin();
    const slug = `authz-${Date.now()}`;
    await createOrg(token, slug);
    const res = await request("/v1/authorization/roles", {
      token,
      tenantSlug: slug,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json).toHaveLength(4);
    expect(json.map((r: any) => r.name).sort()).toEqual(["administrator", "member", "owner", "viewer"]);
  });

  it("requires a tenant slug", async () => {
    const { token } = await registerAndLogin();
    const res = await request("/v1/authorization/roles", { token });
    expect(res.status).toBe(400);
  });

  it("allows the owner to define a custom role", async () => {
    const { token } = await registerAndLogin();
    const slug = `role-${Date.now()}`;
    await createOrg(token, slug);
    const res = await request("/v1/authorization/roles", {
      method: "POST",
      body: { name: "cashier", permissions: ["retail.pos.checkout"] },
      token,
      tenantSlug: slug,
    });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.name).toBe("cashier");
    expect(json.isSystem).toBe(false);
  });
});

describe("HTTP / audit-log", () => {
  it("returns the audit trail for the tenant", async () => {
    const { token } = await registerAndLogin();
    const slug = `audit-${Date.now()}`;
    await createOrg(token, slug);
    const res = await request("/v1/audit-log", { token, tenantSlug: slug });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(json.entries.length).toBeGreaterThan(0);
    const actions = json.entries.map((e: any) => e.action);
    expect(actions).toContain("organization.created");
    expect(actions).toContain("authorization.system_roles_seeded");
    expect(actions).toContain("authorization.role.granted");
  });

  it("returns the count", async () => {
    const { token } = await registerAndLogin();
    const slug = `count-${Date.now()}`;
    await createOrg(token, slug);
    const res = await request("/v1/audit-log/count", { token, tenantSlug: slug });
    expect(res.status).toBe(200);
    const json = await res.json() as any;
    expect(typeof json).toBe("number");
    expect(json).toBeGreaterThan(0);
  });
});

describe("HTTP / tenant isolation", () => {
  it("a user from tenant A cannot access tenant B's audit log", async () => {
    const { token: tokenA } = await registerAndLogin();
    const slugA = `iso-a-${Date.now()}`;
    await createOrg(tokenA, slugA);

    const { token: tokenB } = await registerAndLogin();
    const slugB = `iso-b-${Date.now()}`;
    await createOrg(tokenB, slugB);

    // User B tries to access org A's audit log — not a member.
    const res = await request("/v1/audit-log", { token: tokenB, tenantSlug: slugA });
    expect(res.status).toBe(400);
    const json = await res.json() as any;
    expect(json.error.code).toBe("TENANT_REQUIRED");
  });
});
