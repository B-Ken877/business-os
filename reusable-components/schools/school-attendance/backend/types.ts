/**
 * Domain types for the school-attendance component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// AttendanceRecord
//////////////////////////////////////////////////////////////////////
/** A single attendance record. */
export interface AttendanceRecord {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Student this record is for. */
  readonly studentId: string;
  /** ISO-8601 date of the session. */
  readonly sessionDate: string;
  /** Attendance status. */
  readonly status: string;
  /** Free-form notes (e.g. 'bus delayed'). */
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
