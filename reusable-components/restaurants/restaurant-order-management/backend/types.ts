/**
 * Domain types for the restaurant-order-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Order
//////////////////////////////////////////////////////////////////////
/** A customer order. */
export interface Order {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** JSON-serialised line items. */
  readonly itemsJson: string;
  /** How the order is fulfilled. */
  readonly fulfillmentType: string;
  /** Table reference for dine-in, or null. */
  readonly tableId: string | null;
  /** Delivery address for delivery, or null. */
  readonly deliveryAddress: string | null;
  /** Free-form instructions ('no onions'). */
  readonly specialInstructions: string | null;
  /** Current status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
