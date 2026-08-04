/**
 * Domain types for the clinic-reminders component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Reminder
//////////////////////////////////////////////////////////////////////
/** A scheduled reminder. */
export interface Reminder {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Type of reminder. */
  readonly reminderType: string;
  /** ISO-8601 when the reminder should fire. */
  readonly scheduledFor: string;
  /** JSON-serialised reminder-specific data. */
  readonly payloadJson: string;
  /** Reminder status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
