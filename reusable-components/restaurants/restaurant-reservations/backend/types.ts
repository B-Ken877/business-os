/**
 * Domain types for the restaurant-reservations component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Reservation
//////////////////////////////////////////////////////////////////////
/** A restaurant reservation. */
export interface Reservation {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer name. */
  readonly customerName: string;
  /** Phone for reminders. */
  readonly customerPhone: string | null;
  /** Number of guests. */
  readonly partySize: number;
  /** ISO-8601 timestamp of the reservation. */
  readonly scheduledAt: string;
  /** Assigned table, or null. */
  readonly tableId: string | null;
  /** Reservation status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
