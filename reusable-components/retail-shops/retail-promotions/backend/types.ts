/**
 * Domain types for the retail-promotions component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Promotion
//////////////////////////////////////////////////////////////////////
/** A promotional campaign. */
export interface Promotion {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Human-readable name. */
  readonly name: string;
  /** Type of discount. */
  readonly discountType: string;
  /** Discount value (percentage in bps, or cents for fixed). */
  readonly discountValue: number;
  /** JSON-serialised scope (product ids or category ids). */
  readonly scopeJson: string;
  /** ISO-8601 timestamp the promotion starts. */
  readonly startsAt: string;
  /** ISO-8601 timestamp the promotion ends. */
  readonly endsAt: string;
  /** Promotion status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
