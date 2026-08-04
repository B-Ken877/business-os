/**
 * Domain types for the restaurant-kitchen-display component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// KitchenTicket
//////////////////////////////////////////////////////////////////////
/** A kitchen ticket. */
export interface KitchenTicket {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The order this ticket is for. */
  readonly orderId: string;
  /** JSON-serialised ticket items (mirror of order line items). */
  readonly itemsJson: string;
  /** Station this ticket is routed to. */
  readonly station: string;
  /** Priority (lower = more urgent). */
  readonly priority: number;
  /** Ticket status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
