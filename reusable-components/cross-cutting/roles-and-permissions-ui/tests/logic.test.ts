import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryRolesAndPermissionsUiStore,
  defineRole,
  listRoles,
  listPermissionsForRole,
  defaultConfig,
  type RoleDefinition,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRolesAndPermissionsUiStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "roles.read",
    "roles.manage",
    "permissions.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("roles-and-permissions-ui / defineRole", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      defineRole(ctx, denyDeps, { name: "value", description: undefined, permissionsJson: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("roles-and-permissions-ui / listRoles", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listRoles(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("roles-and-permissions-ui / listPermissionsForRole", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listPermissionsForRole(ctx, denyDeps, { roleName: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("roles-and-permissions-ui / defineRole happy path", () => {
  it("defines a role with valid permissions", () => {
    const { ctx, deps } = setup();
    const r = defineRole(ctx, deps, {
      name: "cashier",
      description: "Front-of-house staff",
      permissionsJson: JSON.stringify(["retail.pos.checkout", "retail.products.read"]),
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.name).toBe("cashier");
    expect(r.value.isSystem).toBe(false);
  });

  it("rejects redefining the owner role when configured to protect it", () => {
    const { ctx, deps } = setup();
    const r = defineRole(ctx, deps, {
      name: "owner",
      permissionsJson: "[]",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });

  it("rejects malformed permissionsJson", () => {
    const { ctx, deps } = setup();
    const r = defineRole(ctx, deps, {
      name: "r1",
      permissionsJson: "not json",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("rejects permission strings without a dot separator", () => {
    const { ctx, deps } = setup();
    const r = defineRole(ctx, deps, {
      name: "r2",
      permissionsJson: JSON.stringify(["edit"]),
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("roles-and-permissions-ui / listPermissionsForRole", () => {
  it("returns the parsed permission list", () => {
    const { ctx, deps } = setup();
    defineRole(ctx, deps, {
      name: "cashier",
      permissionsJson: JSON.stringify(["a.b", "c.d"]),
    });
    const r = listPermissionsForRole(ctx, deps, { roleName: "cashier" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toEqual(["a.b", "c.d"]);
  });
});
