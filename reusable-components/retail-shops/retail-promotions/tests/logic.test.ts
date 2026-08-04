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
  InMemoryRetailPromotionsStore,
  createPromotion,
  activatePromotion,
  listActivePromotions,
  defaultConfig,
  type Promotion,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailPromotionsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.promotions.create",
    "retail.promotions.update",
    "retail.promotions.activate",
    "retail.promotions.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-promotions / createPromotion", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createPromotion(ctx, denyDeps, { name: "value", discountType: "percentage", discountValue: 0, scopeJson: "value", startsAt: "2024-01-15", endsAt: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-promotions / activatePromotion", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      activatePromotion(ctx, denyDeps, { promotionId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-promotions / listActivePromotions", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listActivePromotions(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-promotions / createPromotion rules", () => {
  it("creates a draft promotion", () => {
    const { ctx, deps } = setup();
    const r = createPromotion(ctx, deps, {
      name: "Summer Sale",
      discountType: "percentage",
      discountValue: 2000,  // 20%
      scopeJson: JSON.stringify(["cat-1"]),
      startsAt: "2024-06-01",
      endsAt: "2024-08-31",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("draft");
  });

  it("rejects promotions with startsAt >= endsAt", () => {
    const { ctx, deps } = setup();
    const r = createPromotion(ctx, deps, {
      name: "Bad",
      discountType: "percentage",
      discountValue: 1000,
      scopeJson: "[]",
      startsAt: "2024-08-31",
      endsAt: "2024-06-01",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("rejects percentage discounts over 100%", () => {
    const { ctx, deps } = setup();
    const r = createPromotion(ctx, deps, {
      name: "Bad",
      discountType: "percentage",
      discountValue: 11000,  // 110%
      scopeJson: "[]",
      startsAt: "2024-06-01",
      endsAt: "2024-08-31",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});

describe("retail-promotions / activatePromotion + listActivePromotions", () => {
  it("activates a draft and lists it", () => {
    const { ctx, deps } = setup();
    const p = createPromotion(ctx, deps, {
      name: "Now",
      discountType: "fixed",
      discountValue: 500,
      scopeJson: "[]",
      // Use a wide date range so the test always passes.
      startsAt: "2020-01-01",
      endsAt: "2099-01-01",
    });
    if (!p.ok) throw new Error("setup failed");
    const r = activatePromotion(ctx, deps, { promotionId: p.value.id });
    expect(isOk(r)).toBe(true);
    const list = listActivePromotions(ctx, deps);
    expect(isOk(list)).toBe(true);
    if (!list.ok) return;
    expect(list.value).toHaveLength(1);
  });

  it("rejects activating a non-draft promotion", () => {
    const { ctx, deps } = setup();
    const p = createPromotion(ctx, deps, {
      name: "X", discountType: "fixed", discountValue: 100,
      scopeJson: "[]", startsAt: "2020-01-01", endsAt: "2099-01-01",
    });
    if (!p.ok) throw new Error("setup failed");
    activatePromotion(ctx, deps, { promotionId: p.value.id });
    const r2 = activatePromotion(ctx, deps, { promotionId: p.value.id });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
