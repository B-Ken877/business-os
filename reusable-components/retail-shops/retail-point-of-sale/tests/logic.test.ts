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
  InMemoryRetailPointOfSaleStore,
  checkout,
  getSale,
  defaultConfig,
  type Sale,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailPointOfSaleStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.pos.checkout",
    "retail.pos.refund",
    "retail.pos.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-point-of-sale / checkout", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      checkout(ctx, denyDeps, { itemsJson: "value", discountCents: 0, paymentMethod: "cash", paymentReference: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-point-of-sale / getSale", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      getSale(ctx, denyDeps, { saleId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-point-of-sale / checkout happy path", () => {
  it("computes totals correctly", () => {
    const { ctx, deps } = setup();
    const r = checkout(ctx, deps, {
      itemsJson: JSON.stringify([
        { productId: "p1", quantity: 2, unitPriceCents: 5000 },
        { productId: "p2", quantity: 1, unitPriceCents: 3000 },
      ]),
      discountCents: 1000,
      paymentMethod: "cash",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    // Subtotal: 2*5000 + 1*3000 = 13000
    expect(r.value.subtotalCents).toBe(13000);
    // Discount: 1000
    expect(r.value.discountCents).toBe(1000);
    // Taxable base: 12000, tax at 10% = 1200
    expect(r.value.taxCents).toBe(1200);
    // Total: 12000 + 1200 = 13200
    expect(r.value.totalCents).toBe(13200);
  });

  it("rejects discounts exceeding subtotal", () => {
    const { ctx, deps } = setup();
    const r = checkout(ctx, deps, {
      itemsJson: JSON.stringify([{ productId: "p1", quantity: 1, unitPriceCents: 1000 }]),
      discountCents: 2000,
      paymentMethod: "cash",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });

  it("rejects empty carts", () => {
    const { ctx, deps } = setup();
    const r = checkout(ctx, deps, {
      itemsJson: "[]",
      discountCents: 0,
      paymentMethod: "cash",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("rejects non-positive quantities", () => {
    const { ctx, deps } = setup();
    const r = checkout(ctx, deps, {
      itemsJson: JSON.stringify([{ productId: "p1", quantity: 0, unitPriceCents: 1000 }]),
      discountCents: 0,
      paymentMethod: "cash",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
