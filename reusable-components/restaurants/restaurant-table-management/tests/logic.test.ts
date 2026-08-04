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
  InMemoryRestaurantTableManagementStore,
  createTable,
  assignOrderToTable,
  releaseTable,
  defaultConfig,
  type Table,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantTableManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.tables.manage",
    "restaurant.tables.read",
    "restaurant.tables.assign",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-table-management / createTable", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createTable(ctx, denyDeps, { label: "value", seats: 1 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-table-management / assignOrderToTable", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      assignOrderToTable(ctx, denyDeps, { tableId: "ent_test", orderId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-table-management / releaseTable", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      releaseTable(ctx, denyDeps, { tableId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-table-management / assign + release rules", () => {
  it("assigns an order to a free table and releases it", () => {
    const { ctx, deps } = setup();
    const t = createTable(ctx, deps, { label: "T1", seats: 4 });
    if (!t.ok) throw new Error("setup failed");
    const a = assignOrderToTable(ctx, deps, { tableId: t.value.id, orderId: "ent_o1" });
    expect(isOk(a)).toBe(true);
    if (!a.ok) return;
    expect(a.value.status).toBe("seated");
    const r = releaseTable(ctx, deps, { tableId: t.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("dirty");
  });
  it("rejects assigning to a non-free table", () => {
    const { ctx, deps } = setup();
    const t = createTable(ctx, deps, { label: "T1", seats: 4 });
    if (!t.ok) throw new Error("setup failed");
    assignOrderToTable(ctx, deps, { tableId: t.value.id, orderId: "ent_o1" });
    const r = assignOrderToTable(ctx, deps, { tableId: t.value.id, orderId: "ent_o2" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("rejects releasing a free table", () => {
    const { ctx, deps } = setup();
    const t = createTable(ctx, deps, { label: "T1", seats: 4 });
    if (!t.ok) throw new Error("setup failed");
    const r = releaseTable(ctx, deps, { tableId: t.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
