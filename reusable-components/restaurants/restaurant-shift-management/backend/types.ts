/**
 * Domain types for the restaurant-shift-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Shift
//////////////////////////////////////////////////////////////////////
/** A staff shift. */
export interface Shift {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** User assigned to the shift. */
  readonly staffUserId: string;
  /** ISO-8601 shift start. */
  readonly startsAt: string;
  /** ISO-8601 shift end. */
  readonly endsAt: string;
  /** Role during this shift (e.g. 'server', 'cook'). */
  readonly role: string;
  /** Shift status. */
  readonly status: string;
  /** Notes passed to the next shift. */
  readonly handoffNotes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
