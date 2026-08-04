/**
 * Domain types for the clinic-medical-records component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// MedicalRecord
//////////////////////////////////////////////////////////////////////
/** A medical record entry. */
export interface MedicalRecord {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Doctor who wrote the note. */
  readonly doctorStaffId: string;
  /** Appointment this record is for, or null. */
  readonly appointmentId: string | null;
  /** Free-form consultation notes. */
  readonly consultationNotes: string;
  /** Diagnosis (free-form). */
  readonly diagnosis: string | null;
  /** Treatment plan (free-form). */
  readonly treatmentPlan: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
