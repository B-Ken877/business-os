/**
 * Domain types for the restaurant-billing component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Bill
//////////////////////////////////////////////////////////////////////
/** A restaurant bill. */
export interface Bill {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** JSON-serialised order ids included in this bill. */
  readonly orderIdsJson: string;
  /** Sum of order totals. */
  readonly subtotalCents: number;
  /** Service charge applied. */
  readonly serviceChargeCents: number;
  /** Tax amount. */
  readonly taxCents: number;
  /** Tip amount. */
  readonly tipCents: number;
  /** Grand total. */
  readonly totalCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Bill status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
