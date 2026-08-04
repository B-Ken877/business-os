import { describe, it, expect } from "vitest";
import {
  InMemoryAuditSink,
  createTenantContext,
  asTenantId,
  asUserId,
  asPermission,
  isOk,
  isErr,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryAuthorizationStore,
  defaultAuthorizationConfig,
  StorePermissionChecker,
  seedSystemRoles,
  defineRole,
  grantRole,
  revokeRole,
  listRoles,
  listMyGrants,
} from "../backend";
import type { Dependencies } from "../backend";
import { SYSTEM_ROLES } from "../backend/types";

function setup(): Dependencies {
  const store = new InMemoryAuthorizationStore();
  const audit = new InMemoryAuditSink();
  return { store, audit, config: defaultAuthorizationConfig };
}

describe("authorization / seedSystemRoles", () => {
  it("seeds owner, administrator, member, viewer for a new tenant", () => {
    const deps = setup();
    const tenantId = asTenantId("t-1");
    const r = seedSystemRoles(deps, tenantId, asUserId("u-1"));
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(4);
    expect(r.value.map((r) => r.name).sort()).toEqual(["administrator", "member", "owner", "viewer"]);
    expect(r.value.every((r) => r.isSystem)).toBe(true);
  });
});

describe("authorization / StorePermissionChecker", () => {
  it("grants all permissions to the owner role (wildcard)", () => {
    const deps = setup();
    const tenantId = asTenantId("t-1");
    const userId = asUserId("u-1");
    seedSystemRoles(deps, tenantId, userId);
    // Grant owner role to the user.
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    grantRole(deps, ctx, { userId: "u-1", roleName: SYSTEM_ROLES.OWNER });
    const checker = new StorePermissionChecker(deps.store);
    // Owner can do anything.
    expect(checker.has(ctx, asPermission("anything.anything"))).toBe(true);
    expect(checker.has(ctx, asPermission("retail.products.create"))).toBe(true);
  });

  it("enforces specific permissions for non-owner roles", () => {
    const deps = setup();
    const tenantId = asTenantId("t-1");
    seedSystemRoles(deps, tenantId, asUserId("u-1"));
    // Define a custom role with one specific permission.
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-2" });
    defineRole(deps, ctx, {
      name: "cashier",
      permissions: ["retail.pos.checkout", "retail.products.read"],
    });
    grantRole(deps, ctx, { userId: "u-2", roleName: "cashier" });
    const checker = new StorePermissionChecker(deps.store);
    const ctx2 = createTenantContext({ tenantId: "t-1", userId: "u-2" });
    expect(checker.has(ctx2, asPermission("retail.pos.checkout"))).toBe(true);
    expect(checker.has(ctx2, asPermission("retail.products.read"))).toBe(true);
    expect(checker.has(ctx2, asPermission("retail.products.delete"))).toBe(false);
    expect(checker.has(ctx2, asPermission("clinic.patients.read"))).toBe(false);
  });

  it("supports resource-level wildcards like 'retail.*'", () => {
    const deps = setup();
    const tenantId = asTenantId("t-1");
    seedSystemRoles(deps, tenantId, asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-2" });
    defineRole(deps, ctx, {
      name: "retail-manager",
      permissions: ["retail.*"],
    });
    grantRole(deps, ctx, { userId: "u-2", roleName: "retail-manager" });
    const checker = new StorePermissionChecker(deps.store);
    const ctx2 = createTenantContext({ tenantId: "t-1", userId: "u-2" });
    expect(checker.has(ctx2, asPermission("retail.products.create"))).toBe(true);
    expect(checker.has(ctx2, asPermission("retail.pos.checkout"))).toBe(true);
    expect(checker.has(ctx2, asPermission("clinic.patients.read"))).toBe(false);
  });

  it("is per-tenant — same user, different tenants, different permissions", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    seedSystemRoles(deps, asTenantId("t-2"), asUserId("u-1"));
    const ctxT1 = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const ctxT2 = createTenantContext({ tenantId: "t-2", userId: "u-1" });
    // Grant owner in t-1 only.
    grantRole(deps, ctxT1, { userId: "u-1", roleName: SYSTEM_ROLES.OWNER });
    const checker = new StorePermissionChecker(deps.store);
    expect(checker.has(ctxT1, asPermission("any.thing"))).toBe(true);
    expect(checker.has(ctxT2, asPermission("any.thing"))).toBe(false);
  });

  it("require() throws PermissionDeniedError without revealing the permission", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const checker = new StorePermissionChecker(deps.store);
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-nobody" });
    try {
      checker.require(ctx, asPermission("retail.products.create"));
      throw new Error("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(PermissionDeniedError);
      expect((e as Error).message).not.toContain("retail");
    }
  });
});

describe("authorization / defineRole", () => {
  it("defines a custom role with valid permissions", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const r = defineRole(deps, ctx, {
      name: "cashier",
      description: "Front-of-house",
      permissions: ["retail.pos.checkout"],
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.name).toBe("cashier");
    expect(r.value.isSystem).toBe(false);
  });

  it("rejects redefining system roles", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const r = defineRole(deps, ctx, { name: "owner", permissions: [] });
    expect(isErr(r)).toBe(true);
    if (r.ok) return;
    expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });

  it("rejects duplicate role names", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    defineRole(deps, ctx, { name: "cashier", permissions: ["retail.pos.checkout"] });
    const r = defineRole(deps, ctx, { name: "cashier", permissions: ["retail.pos.checkout"] });
    expect(isErr(r)).toBe(true);
    if (r.ok) return;
    expect(r.error.code).toBe("CONFLICT");
  });

  it("rejects malformed permission strings", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const r = defineRole(deps, ctx, { name: "bad", permissions: ["edit"] });
    expect(isErr(r)).toBe(true);
    if (r.ok) return;
    expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("authorization / grantRole + revokeRole", () => {
  it("grants and revokes a role", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    defineRole(deps, ctx, { name: "cashier", permissions: ["retail.pos.checkout"] });
    const g = grantRole(deps, ctx, { userId: "u-2", roleName: "cashier" });
    expect(isOk(g)).toBe(true);
    const checker = new StorePermissionChecker(deps.store);
    const ctx2 = createTenantContext({ tenantId: "t-1", userId: "u-2" });
    expect(checker.has(ctx2, asPermission("retail.pos.checkout"))).toBe(true);
    const r = revokeRole(deps, ctx, { userId: "u-2", roleName: "cashier" });
    expect(isOk(r)).toBe(true);
    expect(checker.has(ctx2, asPermission("retail.pos.checkout"))).toBe(false);
  });

  it("grantRole is idempotent", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    defineRole(deps, ctx, { name: "cashier", permissions: ["retail.pos.checkout"] });
    const g1 = grantRole(deps, ctx, { userId: "u-2", roleName: "cashier" });
    const g2 = grantRole(deps, ctx, { userId: "u-2", roleName: "cashier" });
    expect(isOk(g1)).toBe(true);
    expect(isOk(g2)).toBe(true);
    if (!g1.ok || !g2.ok) return;
    expect(g1.value.id).toBe(g2.value.id); // same grant, not a duplicate
  });

  it("rejects granting an unknown role", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const r = grantRole(deps, ctx, { userId: "u-2", roleName: "nonexistent" });
    expect(isErr(r)).toBe(true);
    if (r.ok) return;
    expect(r.error.code).toBe("NOT_FOUND");
  });

  it("rejects revoking a grant that doesn't exist", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    const r = revokeRole(deps, ctx, { userId: "u-2", roleName: "cashier" });
    expect(isErr(r)).toBe(true);
    if (r.ok) return;
    expect(r.error.code).toBe("NOT_FOUND");
  });
});

describe("authorization / listRoles + listMyGrants", () => {
  it("lists system + custom roles", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    defineRole(deps, ctx, { name: "cashier", permissions: ["retail.pos.checkout"] });
    const r = listRoles(deps, ctx);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(5); // 4 system + 1 custom
  });

  it("lists the current user's grants", () => {
    const deps = setup();
    seedSystemRoles(deps, asTenantId("t-1"), asUserId("u-1"));
    const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
    grantRole(deps, ctx, { userId: "u-1", roleName: SYSTEM_ROLES.OWNER });
    const r = listMyGrants(deps, ctx);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
    expect(r.value[0].roleName).toBe("owner");
  });
});
