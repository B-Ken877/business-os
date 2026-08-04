/**
 * Domain types for the restaurant-table-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Table
//////////////////////////////////////////////////////////////////////
/** A restaurant table. */
export interface Table {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Human-readable label (e.g. 'T1', 'Patio A'). */
  readonly label: string;
  /** Maximum capacity. */
  readonly seats: number;
  /** Current status. */
  readonly status: string;
  /** Order id currently assigned, or null. */
  readonly currentOrderId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
