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
  InMemoryRestaurantPromotionsStore,
  createCoupon,
  redeemCoupon,
  defaultConfig,
  type Coupon,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantPromotionsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.promotions.manage",
    "restaurant.promotions.read",
    "restaurant.promotions.redeem",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-promotions / createCoupon", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createCoupon(ctx, denyDeps, { code: "value", discountType: "percentage", discountValue: 0, maxRedemptions: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-promotions / redeemCoupon", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      redeemCoupon(ctx, denyDeps, { code: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-promotions / coupon lifecycle", () => {
  it("creates, redeems, and exhausts a coupon", () => {
    const { ctx, deps } = setup();
    const c = createCoupon(ctx, deps, {
      code: "WELCOME10", discountType: "percentage", discountValue: 1000,
      maxRedemptions: 2,
    });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    expect(c.value.status).toBe("active");
    const r1 = redeemCoupon(ctx, deps, { code: "WELCOME10" });
    expect(isOk(r1)).toBe(true);
    if (!r1.ok) return;
    expect(r1.value.redemptionCount).toBe(1);
    expect(r1.value.status).toBe("active");
    const r2 = redeemCoupon(ctx, deps, { code: "WELCOME10" });
    expect(isOk(r2)).toBe(true);
    if (!r2.ok) return;
    expect(r2.value.redemptionCount).toBe(2);
    expect(r2.value.status).toBe("exhausted");
    const r3 = redeemCoupon(ctx, deps, { code: "WELCOME10" });
    expect(isErr(r3)).toBe(true);
    if (!r3.ok) expect(r3.error.code).toBe("LIMIT_EXCEEDED");
  });
  it("rejects duplicate codes", () => {
    const { ctx, deps } = setup();
    createCoupon(ctx, deps, { code: "X", discountType: "fixed", discountValue: 100, maxRedemptions: 0 });
    const r = createCoupon(ctx, deps, { code: "X", discountType: "fixed", discountValue: 100, maxRedemptions: 0 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
});
