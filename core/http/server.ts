/**
 * The HTTP server for Business OS.
 *
 * Uses Hono — a modern, TypeScript-first, lightweight web framework that
 * runs on Node.js, Cloudflare Workers, Deno, and Bun. We use the
 * @hono/node-server adapter to run on Node.js.
 *
 * Architecture:
 *   Request → middleware chain → route handler → response
 *
 * Middleware chain (in order):
 *   1. errorHandler  — catches thrown errors, returns JSON error response
 *   2. authResolver  — extracts session token, verifies, attaches user
 *   3. tenantResolver — extracts tenant slug, resolves, attaches tenant
 *   4. permissionCheck — per-route, checks the required permission
 *
 * Route handlers are thin: they parse the request body, call the
 * appropriate core operation, and return the result as JSON.
 */

import { Hono } from "hono";
import type { Context, Next } from "hono";
import { serve } from "@hono/node-server";
import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  type TenantId,
  type UserId,
  ok,
  err,
  isOk,
  isErr,
  asTenantId,
  asUserId,
  createTenantContext,
  TenantIsolationError,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  type IdentityStore,
  registerUser,
  loginUser,
  verifySession,
  logoutSession,
  changePassword,
  revokeAllSessions,
  defaultIdentityConfig,
  type Dependencies as IdentityDeps,
} from "@business-os/core/identity";
import {
  type OrganizationsStore,
  createOrganization,
  inviteMember,
  acceptInvitation,
  revokeMembership,
  listOrganizationsForUser,
  resolveTenantBySlug,
  defaultOrganizationsConfig,
  type Dependencies as OrgDeps,
} from "@business-os/core/organizations";
import {
  type AuthorizationStore,
  StorePermissionChecker,
  seedSystemRoles,
  defineRole,
  grantRole,
  revokeRole,
  listRoles,
  listMyGrants,
  defaultAuthorizationConfig,
  type Dependencies as AuthzDeps,
} from "@business-os/core/authorization";
import {
  type AuditLogStore,
  PersistentAuditSink,
  queryAuditLog,
  countAuditEntries,
  defaultAuditLogConfig,
  type Dependencies as AuditDeps,
} from "@business-os/core/audit-log";

import { registerAllComponentRoutes } from "./generated-component-routes";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ServerDeps {
  readonly identity: IdentityStore;
  readonly organizations: OrganizationsStore;
  readonly authorization: AuthorizationStore;
  readonly auditLog: AuditLogStore;
}

export interface AuthState {
  readonly userId: string | null;
  readonly user: { id: string; email: string; fullName: string } | null;
  readonly tenantId: string | null;
  readonly tenantSlug: string | null;
  readonly sessionToken: string | null;
}

// Hono context variables — attached by middleware.
type AppEnv = {
  Variables: {
    deps: ServerDeps;
    auditSink: PersistentAuditSink;
    auth: AuthState;
    tenantCtx: TenantContext | null;
  };
};

// ---------------------------------------------------------------------------
// Error helpers
// ---------------------------------------------------------------------------

export function errorResponse(error: { code: string; message: string }, status = 400): Response {
  return Response.json({ error }, { status });
}

export function resultResponse<T>(result: Result<T>): Response {
  if (isOk(result)) {
    return Response.json(result.value);
  }
  if (isErr(result)) {
    const status = errorCodeToStatus(result.error.code);
    return errorResponse(result.error, status);
  }
  return errorResponse({ code: "INTERNAL_ERROR", message: "unexpected result state" }, 500);
}

function errorCodeToStatus(code: string): number {
  switch (code) {
    case "NOT_FOUND": return 404;
    case "CONFLICT": return 409;
    case "PERMISSION_DENIED": return 403;
    case "TENANT_ISOLATION_VIOLATION": return 403;
    case "LIMIT_EXCEEDED": return 429;
    case "NOT_SUPPORTED": return 501;
    case "BUSINESS_RULE_VIOLATION": return 422;
    case "PRECONDITION_FAILED": return 412;
    case "DEPENDENCY_ERROR": return 502;
    default: return 400; // INVALID_INPUT, THROWN, etc.
  }
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

/** Attach the server dependencies to the Hono context. */
function depsMiddleware(deps: ServerDeps) {
  const auditSink = new PersistentAuditSink(deps.auditLog);
  return async (c: Context<AppEnv>, next: Next) => {
    c.set("deps", deps);
    c.set("auditSink", auditSink);
    c.set("auth", { userId: null, user: null, tenantId: null, tenantSlug: null, sessionToken: null });
    c.set("tenantCtx", null);
    await next();
  };
}

/** Error handler — catches thrown errors and returns a JSON response. */
async function errorHandler(c: Context<AppEnv>, next: Next) {
  try {
    await next();
  } catch (e) {
    if (e instanceof PermissionDeniedError) {
      return errorResponse({ code: "PERMISSION_DENIED", message: "permission denied" }, 403);
    }
    if (e instanceof TenantIsolationError) {
      return errorResponse({ code: "TENANT_ISOLATION_VIOLATION", message: "tenant boundary violation" }, 403);
    }
    const message = e instanceof Error ? e.message : String(e);
    console.error("[http] unhandled error:", e);
    return errorResponse({ code: "INTERNAL_ERROR", message: "an unexpected error occurred" }, 500);
  }
}

/**
 * Auth resolver — extracts the session token from the Authorization header,
 * verifies it, and attaches the user to the context.
 *
 * If no token is present, the user remains null (anonymous). Routes that
 * require authentication will fail at the permission check.
 */
async function authResolver(c: Context<AppEnv>, next: Next) {
  const deps = c.get("deps");
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const result = verifySession(
      { store: deps.identity, audit: c.get("auditSink"), config: defaultIdentityConfig },
      token
    );
    if (isOk(result)) {
      const { user, session } = result.value;
      c.set("auth", {
        userId: user.id,
        user: { id: user.id, email: user.email, fullName: user.fullName },
        tenantId: null,
        tenantSlug: null,
        sessionToken: token,
      });
    }
  }
  await next();
}

/**
 * Tenant resolver — extracts the tenant slug from the X-Tenant-Slug header
 * and resolves it to an organization. Also verifies that the authenticated
 * user is a member of that tenant.
 *
 * If no slug is present, the tenant remains null (platform-wide routes
 * like /v1/identity/* don't need a tenant).
 */
async function tenantResolver(c: Context<AppEnv>, next: Next) {
  const deps = c.get("deps");
  const slug = c.req.header("X-Tenant-Slug");
  const auth = c.get("auth");

  if (slug) {
    const orgResult = resolveTenantBySlug(
      { store: deps.organizations, audit: c.get("auditSink"), config: defaultOrganizationsConfig },
      slug
    );
    if (isOk(orgResult)) {
      const org = orgResult.value;
      // If the user is authenticated, verify membership and build the TenantContext.
      if (auth.userId) {
        const membership = deps.organizations.findMembership(org.id, auth.userId as EntityId);
        if (membership) {
          // Load the user's role names for this tenant.
          const grants = deps.authorization.listActiveGrantsForUser(org.id as TenantId, auth.userId as UserId);
          const roles = grants.map((g) => g.roleName);
          const ctx = createTenantContext({
            tenantId: org.id,
            userId: auth.userId,
            roles,
          });
          c.set("tenantCtx", ctx);
          c.set("auth", { ...auth, tenantId: org.id, tenantSlug: org.slug });
        }
      }
    }
  }
  await next();
}

/**
 * Require authentication — returns 401 if no user is attached.
 */
export function requireAuth(c: Context<AppEnv>): Response | null {
  if (!c.get("auth").userId) {
    return errorResponse({ code: "UNAUTHORIZED", message: "authentication required" }, 401);
  }
  return null;
}

/**
 * Require a tenant context — returns 400 if no tenant is resolved.
 */
export function requireTenant(c: Context<AppEnv>): Response | null {
  if (!c.get("tenantCtx")) {
    return errorResponse({ code: "TENANT_REQUIRED", message: "X-Tenant-Slug header is required" }, 400);
  }
  return null;
}

/**
 * Require a specific permission. Returns 403 if the user lacks it.
 */
export function requirePermission(c: Context<AppEnv>, permission: string): Response | null {
  const ctx = c.get("tenantCtx");
  if (!ctx) {
    return errorResponse({ code: "TENANT_REQUIRED", message: "tenant context required" }, 400);
  }
  const deps = c.get("deps");
  const checker = new StorePermissionChecker(deps.authorization);
  try {
    checker.require(ctx, permission as any);
  } catch {
    return errorResponse({ code: "PERMISSION_DENIED", message: "permission denied" }, 403);
  }
  return null;
}

// ---------------------------------------------------------------------------
// Route handlers
// ---------------------------------------------------------------------------

export async function getJsonBody<T = unknown>(c: Context<AppEnv>): Promise<T | null> {
  try {
    return await c.req.json();
  } catch {
    return null;
  }
}

// --- Identity routes ---

function registerIdentityRoutes(app: Hono<AppEnv>) {
  // POST /v1/identity/register
  app.post("/v1/identity/register", async (c) => {
    const body = await getJsonBody<{
      email: string; fullName: string; password: string;
    }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const result = await registerUser(
      { store: deps.identity, audit: c.get("auditSink"), config: defaultIdentityConfig },
      body
    );
    if (isOk(result)) {
      // Don't return the password hash or credential.
      return Response.json({
        user: { id: result.value.user.id, email: result.value.user.email, fullName: result.value.user.fullName },
        sessionToken: result.value.session.token,
      });
    }
    return resultResponse(result);
  });

  // POST /v1/identity/login
  app.post("/v1/identity/login", async (c) => {
    const body = await getJsonBody<{ email: string; password: string }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const result = await loginUser(
      { store: deps.identity, audit: c.get("auditSink"), config: defaultIdentityConfig },
      {
        ...body,
        createdByIp: c.req.header("X-Forwarded-For") ?? undefined,
        createdByUserAgent: c.req.header("User-Agent") ?? undefined,
      }
    );
    if (isOk(result)) {
      return Response.json({
        user: { id: result.value.user.id, email: result.value.user.email, fullName: result.value.user.fullName },
        sessionToken: result.value.session.token,
      });
    }
    return resultResponse(result);
  });

  // POST /v1/identity/logout
  app.post("/v1/identity/logout", async (c) => {
    const auth = c.get("auth");
    if (!auth.sessionToken) return errorResponse({ code: "UNAUTHORIZED", message: "no session" }, 401);
    const deps = c.get("deps");
    logoutSession(
      { store: deps.identity, audit: c.get("auditSink"), config: defaultIdentityConfig },
      auth.sessionToken
    );
    return Response.json({ ok: true });
  });

  // GET /v1/identity/me
  app.get("/v1/identity/me", async (c) => {
    const auth = c.get("auth");
    const unauthorized = requireAuth(c);
    if (unauthorized) return unauthorized;
    return Response.json({ user: auth.user });
  });

  // POST /v1/identity/change-password
  app.post("/v1/identity/change-password", async (c) => {
    const unauthorized = requireAuth(c);
    if (unauthorized) return unauthorized;
    const body = await getJsonBody<{ currentPassword: string; newPassword: string }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const result = await changePassword(
      { store: deps.identity, audit: c.get("auditSink"), config: defaultIdentityConfig },
      { userId: c.get("auth").userId!, currentPassword: body.currentPassword, newPassword: body.newPassword }
    );
    return resultResponse(result);
  });
}

// --- Organizations routes ---

function registerOrganizationRoutes(app: Hono<AppEnv>) {
  // POST /v1/organizations — create a new org (authenticated)
  app.post("/v1/organizations", async (c) => {
    const unauthorized = requireAuth(c);
    if (unauthorized) return unauthorized;
    const body = await getJsonBody<{ name: string; slug: string; industry: string }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    // Create the org with the current user as owner.
    const orgResult = createOrganization(
      { store: deps.organizations, audit: c.get("auditSink"), config: defaultOrganizationsConfig },
      { ...body, creatorUserId: c.get("auth").userId! }
    );
    if (isErr(orgResult)) return resultResponse(orgResult);
    // After isErr check, TypeScript still doesn't narrow. Access .value safely.
    const orgData = isOk(orgResult) ? orgResult.value : null;
    if (!orgData) return errorResponse({ code: "INTERNAL_ERROR", message: "unexpected" }, 500);
    // Seed system roles for the new org.
    seedSystemRoles(
      { store: deps.authorization, audit: c.get("auditSink"), config: defaultAuthorizationConfig },
      orgData.organization.id as TenantId,
      c.get("auth").userId! as unknown as UserId
    );
    // Grant the owner role to the creator.
    const ctx = createTenantContext({
      tenantId: orgData.organization.id,
      userId: c.get("auth").userId!,
    });
    grantRole(
      { store: deps.authorization, audit: c.get("auditSink"), config: defaultAuthorizationConfig },
      ctx,
      { userId: c.get("auth").userId!, roleName: "owner" }
    );
    return Response.json(orgData);
  });

  // GET /v1/organizations/mine — list orgs the current user belongs to
  app.get("/v1/organizations/mine", async (c) => {
    const unauthorized = requireAuth(c);
    if (unauthorized) return unauthorized;
    const deps = c.get("deps");
    const result = listOrganizationsForUser(
      { store: deps.organizations, audit: c.get("auditSink"), config: defaultOrganizationsConfig },
      c.get("auth").userId! as EntityId
    );
    return resultResponse(result);
  });

  // POST /v1/organizations/invitations/accept
  app.post("/v1/organizations/invitations/accept", async (c) => {
    const unauthorized = requireAuth(c);
    if (unauthorized) return unauthorized;
    const body = await getJsonBody<{ token: string }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const result = acceptInvitation(
      { store: deps.organizations, audit: c.get("auditSink"), config: defaultOrganizationsConfig },
      { token: body.token, userId: c.get("auth").userId! }
    );
    return resultResponse(result);
  });

  // POST /v1/organizations/{orgId}/invitations — invite a member (requires organization.invite)
  app.post("/v1/organizations/:orgId/invitations", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "organization.invite");
    if (noPerm) return noPerm;
    const body = await getJsonBody<{ email: string; role: string }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const result = inviteMember(
      { store: deps.organizations, audit: c.get("auditSink"), config: defaultOrganizationsConfig },
      { organizationId: c.req.param("orgId"), email: body.email, role: body.role, invitedByUserId: c.get("auth").userId! }
    );
    return resultResponse(result);
  });

  // DELETE /v1/organizations/{orgId}/memberships/{membershipId}
  app.delete("/v1/organizations/:orgId/memberships/:membershipId", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "organization.manage_members");
    if (noPerm) return noPerm;
    const deps = c.get("deps");
    const result = revokeMembership(
      { store: deps.organizations, audit: c.get("auditSink"), config: defaultOrganizationsConfig },
      { membershipId: c.req.param("membershipId") }
    );
    return resultResponse(result);
  });
}

// --- Authorization routes ---

function registerAuthorizationRoutes(app: Hono<AppEnv>) {
  // GET /v1/authorization/roles
  app.get("/v1/authorization/roles", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "roles.read");
    if (noPerm) return noPerm;
    const deps = c.get("deps");
    const ctx = c.get("tenantCtx")!;
    const result = listRoles(
      { store: deps.authorization, audit: c.get("auditSink"), config: defaultAuthorizationConfig },
      ctx
    );
    return resultResponse(result);
  });

  // POST /v1/authorization/roles
  app.post("/v1/authorization/roles", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "roles.manage");
    if (noPerm) return noPerm;
    const body = await getJsonBody<{ name: string; description?: string; permissions: string[] }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const ctx = c.get("tenantCtx")!;
    const result = defineRole(
      { store: deps.authorization, audit: c.get("auditSink"), config: defaultAuthorizationConfig },
      ctx,
      body
    );
    return resultResponse(result);
  });

  // POST /v1/authorization/grants
  app.post("/v1/authorization/grants", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "roles.manage");
    if (noPerm) return noPerm;
    const body = await getJsonBody<{ userId: string; roleName: string }>(c);
    if (!body) return errorResponse({ code: "INVALID_INPUT", message: "body required" });
    const deps = c.get("deps");
    const ctx = c.get("tenantCtx")!;
    const result = grantRole(
      { store: deps.authorization, audit: c.get("auditSink"), config: defaultAuthorizationConfig },
      ctx,
      body
    );
    return resultResponse(result);
  });

  // GET /v1/authorization/grants/mine
  app.get("/v1/authorization/grants/mine", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const deps = c.get("deps");
    const ctx = c.get("tenantCtx")!;
    const result = listMyGrants(
      { store: deps.authorization, audit: c.get("auditSink"), config: defaultAuthorizationConfig },
      ctx
    );
    return resultResponse(result);
  });
}

// --- Audit-log routes ---

function registerAuditLogRoutes(app: Hono<AppEnv>) {
  // GET /v1/audit-log
  app.get("/v1/audit-log", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "audit.read");
    if (noPerm) return noPerm;
    const deps = c.get("deps");
    const ctx = c.get("tenantCtx")!;
    const query: any = { tenantId: ctx.tenantId };
    const componentId = c.req.query("componentId");
    if (componentId) query.componentId = componentId;
    const action = c.req.query("action");
    if (action) query.action = action;
    const limit = c.req.query("limit");
    if (limit) query.limit = parseInt(limit, 10);
    const result = queryAuditLog({ store: deps.auditLog, config: defaultAuditLogConfig }, query);
    return resultResponse(result);
  });

  // GET /v1/audit-log/count
  app.get("/v1/audit-log/count", async (c) => {
    const noTenant = requireTenant(c);
    if (noTenant) return noTenant;
    const noPerm = requirePermission(c, "audit.read");
    if (noPerm) return noPerm;
    const deps = c.get("deps");
    const ctx = c.get("tenantCtx")!;
    const result = countAuditEntries(
      { store: deps.auditLog, config: defaultAuditLogConfig },
      { tenantId: ctx.tenantId }
    );
    return resultResponse(result);
  });
}

// ---------------------------------------------------------------------------
// App factory
// ---------------------------------------------------------------------------

/**
 * Build the Hono app with all routes registered.
 *
 * To extend with reusable component routes, call `registerComponentRoutes`
 * after this, or add routes directly to the returned app.
 */
export function createApp(deps: ServerDeps): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  // Middleware chain (order matters).
  app.use("*", depsMiddleware(deps));
  app.use("*", errorHandler);
  app.use("*", authResolver);
  app.use("*", tenantResolver);

  // Health check.
  app.get("/health", (c) => Response.json({ ok: true, timestamp: new Date().toISOString() }));

  // Core routes.
  registerIdentityRoutes(app);
  registerOrganizationRoutes(app);
  registerAuthorizationRoutes(app);
  registerAuditLogRoutes(app);

  // Component routes (all 65 reusable components, 150 operations).
  registerAllComponentRoutes(app, deps, {
    requireTenant,
    requirePermission,
    requireAuth,
    getJsonBody,
    resultResponse,
    errorResponse,
  });

  return app;
}

/**
 * Start the HTTP server on the given port.
 */
export function startServer(deps: ServerDeps, port = Number(process.env.PORT ?? 3000)): ReturnType<typeof serve> {
  const app = createApp(deps);
  return serve({ fetch: app.fetch, port });
}
