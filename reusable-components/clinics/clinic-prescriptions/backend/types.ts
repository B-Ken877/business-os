/**
 * Domain types for the clinic-prescriptions component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Prescription
//////////////////////////////////////////////////////////////////////
/** A prescription. */
export interface Prescription {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Prescribing doctor. */
  readonly doctorStaffId: string;
  /** Medical record this prescription is from, or null. */
  readonly medicalRecordId: string | null;
  /** Medication name. */
  readonly medicationName: string;
  /** Dosage instructions (e.g. '500mg twice daily'). */
  readonly dosage: string;
  /** Duration in days. */
  readonly durationDays: number;
  /** Refills remaining. */
  readonly refillsRemaining: number;
  /** Prescription status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
