/**
 * Domain types for the clinic-appointments component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Appointment
//////////////////////////////////////////////////////////////////////
/** A patient appointment. */
export interface Appointment {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Doctor (staff id). */
  readonly doctorStaffId: string;
  /** ISO-8601 appointment time. */
  readonly scheduledAt: string;
  /** Appointment duration. */
  readonly durationMinutes: number;
  /** Reason for visit (free-form). */
  readonly reason: string | null;
  /** Appointment status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
