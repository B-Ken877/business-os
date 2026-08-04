/**
 * Domain types for the service-booking component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Booking
//////////////////////////////////////////////////////////////////////
/** A service booking. */
export interface Booking {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer. */
  readonly customerId: string;
  /** Service booked. */
  readonly serviceId: string;
  /** Staff assigned. */
  readonly staffUserId: string;
  /** ISO-8601 booking time. */
  readonly scheduledAt: string;
  /** Duration (from service). */
  readonly durationMinutes: number;
  /** Booking status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
