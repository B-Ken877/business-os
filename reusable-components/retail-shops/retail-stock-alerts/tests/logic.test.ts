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
  InMemoryRetailStockAlertsStore,
  evaluateStockLevel,
  listActiveAlerts,
  defaultConfig,
  type StockAlert,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailStockAlertsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.stockalerts.evaluate",
    "retail.stockalerts.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-stock-alerts / evaluateStockLevel", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      evaluateStockLevel(ctx, denyDeps, { productId: "ent_test", currentQuantity: 0, threshold: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-stock-alerts / listActiveAlerts", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listActiveAlerts(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-stock-alerts / evaluateStockLevel rules", () => {
  it("emits an out_of_stock alert when quantity is zero", () => {
    const { ctx, deps } = setup();
    const r = evaluateStockLevel(ctx, deps, {
      productId: "ent_p1",
      currentQuantity: 0,
      threshold: 5,
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).not.toBeNull();
    expect(r.value!.alertType).toBe("out_of_stock");
  });

  it("emits a low_stock alert when quantity is below threshold", () => {
    const { ctx, deps } = setup();
    const r = evaluateStockLevel(ctx, deps, {
      productId: "ent_p1",
      currentQuantity: 3,
      threshold: 5,
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).not.toBeNull();
    expect(r.value!.alertType).toBe("low_stock");
  });

  it("does NOT emit when quantity is at or above threshold", () => {
    const { ctx, deps } = setup();
    const r = evaluateStockLevel(ctx, deps, {
      productId: "ent_p1",
      currentQuantity: 5,
      threshold: 5,
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBeNull();
  });

  it("suppresses duplicate alerts within the suppression window", () => {
    const { ctx, deps } = setup();
    evaluateStockLevel(ctx, deps, { productId: "ent_p1", currentQuantity: 0, threshold: 5 });
    const r2 = evaluateStockLevel(ctx, deps, { productId: "ent_p1", currentQuantity: 0, threshold: 5 });
    expect(isOk(r2)).toBe(true);
    if (!r2.ok) return;
    expect(r2.value).toBeNull();  // suppressed
  });
});
