import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { openDatabase, createStores } from "../index";
import type { DatabaseType } from "../index";
import {
  asTenantId,
  asUserId,
  createTenantContext,
  isOk,
} from "@business-os/shared";
import {
  registerUser,
  loginUser,
  defaultIdentityConfig,
} from "@business-os/core/identity";
import {
  createOrganization,
  defaultOrganizationsConfig,
} from "@business-os/core/organizations";
import {
  seedSystemRoles,
  grantRole,
  StorePermissionChecker,
  defaultAuthorizationConfig,
} from "@business-os/core/authorization";
import {
  queryAuditLog,
  defaultAuditLogConfig,
} from "@business-os/core/audit-log";
import { PersistentAuditSink } from "@business-os/core/audit-log";

let db: DatabaseType;

beforeEach(() => {
  db = openDatabase({ path: ":memory:" });
});

afterEach(() => {
  db.close();
});

describe("persistence-sqlite / full stack", () => {
  it("registers a user, creates an org, seeds roles, and queries audit log — all persisted", async () => {
    const stores = createStores(db);
    const auditSink = new PersistentAuditSink(stores.auditLog);

    // 1. Register a user.
    const identityDeps = { store: stores.identity, audit: auditSink, config: defaultIdentityConfig };
    const reg = await registerUser(identityDeps, {
      email: "owner@example.com",
      fullName: "Owner",
      password: "very-strong-password-123",
    });
    expect(isOk(reg)).toBe(true);
    if (!reg.ok) return;
    const userId = reg.value.user.id;

    // Verify persistence: re-fetch the user from the DB.
    const fetched = stores.identity.getUser(userId);
    expect(fetched?.email).toBe("owner@example.com");

    // 2. Create an organization.
    const orgDeps = { store: stores.organizations, audit: auditSink, config: defaultOrganizationsConfig };
    const orgResult = createOrganization(orgDeps, {
      name: "Resto Lakou",
      slug: "resto-lakou",
      industry: "restaurants",
      creatorUserId: userId,
    });
    expect(isOk(orgResult)).toBe(true);
    if (!orgResult.ok) return;
    const orgId = orgResult.value.organization.id;

    // Verify persistence.
    const fetchedOrg = stores.organizations.getOrganizationBySlug("resto-lakou");
    expect(fetchedOrg?.name).toBe("Resto Lakou");

    // 3. Seed system roles + grant owner.
    const authzDeps = { store: stores.authorization, audit: auditSink, config: defaultAuthorizationConfig };
    seedSystemRoles(authzDeps, asTenantId(orgId), asUserId(userId));
    const ctx = createTenantContext({ tenantId: orgId, userId });
    grantRole(authzDeps, ctx, { userId, roleName: "owner" });

    // Verify persistence: the role definition is in the DB.
    const ownerRole = stores.authorization.getRoleDefinition(asTenantId(orgId), "owner");
    expect(ownerRole?.isSystem).toBe(true);
    expect(ownerRole?.permissions).toContain("*.*");

    // 4. Verify the StorePermissionChecker works against SQLite.
    const checker = new StorePermissionChecker(stores.authorization);
    expect(checker.has(ctx, "anything.anything" as any)).toBe(true);

    // 5. Query the audit log — should have entries from registration, org creation, role seeding.
    const auditDeps = { store: stores.auditLog, config: defaultAuditLogConfig };
    const auditResult = queryAuditLog(auditDeps, { tenantId: asTenantId(orgId) });
    expect(isOk(auditResult)).toBe(true);
    if (!auditResult.ok) return;
    expect(auditResult.value.entries.length).toBeGreaterThan(0);
    // Identity events use the "_platform" tenant — verify they're there too.
    const platformAudits = queryAuditLog(auditDeps, { tenantId: asTenantId("_platform") });
    if (platformAudits.ok) {
      expect(platformAudits.value.entries.length).toBeGreaterThan(0);
      expect(platformAudits.value.entries.some((e) => e.action === "identity.user.registered")).toBe(true);
    }
  });

  it("persists sessions across store instances (simulating server restart)", async () => {
    const stores1 = createStores(db);
    const auditSink = new PersistentAuditSink(stores1.auditLog);
    const identityDeps = { store: stores1.identity, audit: auditSink, config: defaultIdentityConfig };

    // Register + get session.
    const reg = await registerUser(identityDeps, {
      email: "persist@example.com",
      fullName: "Persist",
      password: "very-strong-password-123",
    });
    if (!reg.ok) return;
    const token = reg.value.session.token;

    // Simulate a restart: create new store instances pointing at the same DB.
    const stores2 = createStores(db);
    const session = stores2.identity.getSession(token);
    expect(session).toBeDefined();
    expect(session?.userId).toBe(reg.value.user.id);
    expect(session?.status).toBe("active");
  });
});
