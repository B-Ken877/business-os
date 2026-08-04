/**
 * Domain types for the restaurant-delivery-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Delivery
//////////////////////////////////////////////////////////////////////
/** A delivery for an order. */
export interface Delivery {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The order being delivered. */
  readonly orderId: string;
  /** Delivery address. */
  readonly address: string;
  /** Assigned driver, or null. */
  readonly driverId: string | null;
  /** Delivery status. */
  readonly status: string;
  /** ISO-8601 pickup timestamp, or null. */
  readonly pickedUpAt: string | null;
  /** ISO-8601 delivery timestamp, or null. */
  readonly deliveredAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
