/**
 * Domain types for the restaurant-promotions component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Coupon
//////////////////////////////////////////////////////////////////////
/** A redeemable coupon. */
export interface Coupon {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Coupon code (unique per tenant). */
  readonly code: string;
  /** Type of discount. */
  readonly discountType: string;
  /** Discount value (bps or cents). */
  readonly discountValue: number;
  /** Maximum times this coupon can be redeemed (0 = unlimited). */
  readonly maxRedemptions: number;
  /** Times redeemed so far. */
  readonly redemptionCount: number;
  /** Coupon status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
