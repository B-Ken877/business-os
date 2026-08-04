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
  InMemoryRestaurantBillingStore,
  generateBill,
  markPaid,
  defaultConfig,
  type Bill,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantBillingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.billing.generate",
    "restaurant.billing.read",
    "restaurant.billing.record_payment",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-billing / generateBill", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      generateBill(ctx, denyDeps, { orderIdsJson: "value", tipCents: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-billing / markPaid", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markPaid(ctx, denyDeps, { billId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-billing / generate + markPaid rules", () => {
  it("generates a bill and marks it paid", () => {
    const { ctx, deps } = setup();
    const r = generateBill(ctx, deps, {
      orderIdsJson: JSON.stringify(["ent_o1", "ent_o2"]),
      tipCents: 500,
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("open");
    expect(r.value.tipCents).toBe(500);
    const p = markPaid(ctx, deps, { billId: r.value.id });
    expect(isOk(p)).toBe(true);
    if (!p.ok) return;
    expect(p.value.status).toBe("paid");
  });
  it("rejects marking an already-paid bill", () => {
    const { ctx, deps } = setup();
    const b = generateBill(ctx, deps, { orderIdsJson: JSON.stringify(["o"]), tipCents: 0 });
    if (!b.ok) throw new Error("setup failed");
    markPaid(ctx, deps, { billId: b.value.id });
    const r = markPaid(ctx, deps, { billId: b.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
