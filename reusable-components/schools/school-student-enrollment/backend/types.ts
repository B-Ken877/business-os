/**
 * Domain types for the school-student-enrollment component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Student
//////////////////////////////////////////////////////////////////////
/** A student record. */
export interface Student {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Student first name. */
  readonly firstName: string;
  /** Student last name. */
  readonly lastName: string;
  /** ISO-8601 date of birth. */
  readonly dateOfBirth: string;
  /** Primary guardian name. */
  readonly guardianName: string;
  /** Guardian phone. */
  readonly guardianPhone: string | null;
  /** Enrollment status. */
  readonly enrollmentStatus: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
