/**
 * Business logic for the restaurant-promotions component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  Coupon,
} from "./types";

import {
  type CreateCouponInput,
  validateCreateCouponInput,
  type RedeemCouponInput,
  validateRedeemCouponInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantPromotionsStore {
  getCoupon(tenantId: string, id: EntityId): Coupon | undefined;
  putCoupon(tenantId: string, entity: Coupon): void;
  listCoupons(tenantId: string): readonly Coupon[];
  deleteCoupon(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantPromotionsStore implements RestaurantPromotionsStore {
  private readonly coupons = new Map<string, Map<string, Coupon>>();

  getCoupon(tenantId: string, id: EntityId): Coupon | undefined {
    return this.coupons.get(tenantId)?.get(id);
  }
  putCoupon(tenantId: string, entity: Coupon): void {
    let byId = this.coupons.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.coupons.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listCoupons(tenantId: string): readonly Coupon[] {
    const byId = this.coupons.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteCoupon(tenantId: string, id: EntityId): boolean {
    return this.coupons.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantPromotionsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxActiveCoupons: number;
}

//////////////////////////////////////////////////////////////////////
// createCoupon — Create a new coupon.
//////////////////////////////////////////////////////////////////////
export function createCoupon(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateCouponInput
): Result<Coupon> {
  deps.permissions.require(ctx, asPermission("restaurant.promotions.manage"));
  const validated = validateCreateCouponInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const existing = deps.store.listCoupons(ctx.tenantId);
    if (existing.some((c) => c.code === v.code)) {
      return err(ErrorCode.CONFLICT, "coupon code already exists");
    }
    if (v.discountType === "percentage" && v.discountValue > 10000) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "percentage discount cannot exceed 100%");
    }
    const id = asEntityId("cpn_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const coupon: Coupon = {
      id, tenantId: ctx.tenantId, code: v.code, discountType: v.discountType,
      discountValue: v.discountValue, maxRedemptions: v.maxRedemptions,
      redemptionCount: 0, status: "active", createdAt: now, updatedAt: now,
    };
    deps.store.putCoupon(ctx.tenantId, coupon);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-promotions",
      action: "restaurant.coupon.created", entityType: "coupon", entityId: id,
      details: { code: v.code, discountType: v.discountType },
    }));
    return ok(coupon);
}

//////////////////////////////////////////////////////////////////////
// redeemCoupon — Redeem a coupon. Increments the redemption count and enforces the max.
//////////////////////////////////////////////////////////////////////
export function redeemCoupon(
  ctx: TenantContext,
  deps: Dependencies,
  input: RedeemCouponInput
): Result<Coupon> {
  deps.permissions.require(ctx, asPermission("restaurant.promotions.redeem"));
  const validated = validateRedeemCouponInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listCoupons(ctx.tenantId);
    const coupon = all.find((c) => c.code === v.code);
    if (!coupon) return err(ErrorCode.NOT_FOUND, "coupon not found");
    assertSameTenant(ctx, coupon.tenantId);
    // Check the redemption limit BEFORE the status, so an exhausted coupon
    // returns LIMIT_EXCEEDED (the more specific error).
    if (coupon.maxRedemptions > 0 && coupon.redemptionCount >= coupon.maxRedemptions) {
      return err(ErrorCode.LIMIT_EXCEEDED, "coupon redemption limit reached");
    }
    if (coupon.status !== "active") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "coupon is not active");
    }
    const newRedemptions = coupon.redemptionCount + 1;
    const isNowExhausted = coupon.maxRedemptions > 0 && newRedemptions >= coupon.maxRedemptions;
    const updated: Coupon = {
      ...coupon,
      redemptionCount: newRedemptions,
      status: isNowExhausted ? "exhausted" : coupon.status,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putCoupon(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-promotions",
      action: "restaurant.coupon.redeemed", entityType: "coupon", entityId: updated.id,
      details: { code: coupon.code, newRedemptionCount: updated.redemptionCount },
    }));
    return ok(updated);
}
