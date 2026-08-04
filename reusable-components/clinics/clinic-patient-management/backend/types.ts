/**
 * Domain types for the clinic-patient-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Patient
//////////////////////////////////////////////////////////////////////
/** A patient record. */
export interface Patient {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient first name. */
  readonly firstName: string;
  /** Patient last name. */
  readonly lastName: string;
  /** ISO-8601 date of birth. */
  readonly dateOfBirth: string;
  /** Phone. */
  readonly phone: string | null;
  /** Email. */
  readonly email: string | null;
  /** Physical address. */
  readonly address: string | null;
  /** Clinic-assigned medical record number (unique per tenant). */
  readonly medicalRecordNumber: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
