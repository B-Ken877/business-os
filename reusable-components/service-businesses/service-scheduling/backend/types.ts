/**
 * Domain types for the service-scheduling component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// StaffAvailability
//////////////////////////////////////////////////////////////////////
/** A staff member's working hours for a day. */
export interface StaffAvailability {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Staff. */
  readonly staffUserId: string;
  /** Day of week (1=Monday, 7=Sunday). */
  readonly dayOfWeek: number;
  /** Start hour. */
  readonly startHour: number;
  /** End hour. */
  readonly endHour: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// TimeOff
//////////////////////////////////////////////////////////////////////
/** A staff member's time off. */
export interface TimeOff {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Staff. */
  readonly staffUserId: string;
  /** ISO-8601 start. */
  readonly startsAt: string;
  /** ISO-8601 end. */
  readonly endsAt: string;
  /** Reason (e.g. 'vacation', 'sick'). */
  readonly reason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
