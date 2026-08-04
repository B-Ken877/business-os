/**
 * Domain types for the school-teacher-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Teacher
//////////////////////////////////////////////////////////////////////
/** A teacher record. */
export interface Teacher {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** First name. */
  readonly firstName: string;
  /** Last name. */
  readonly lastName: string;
  /** Email. */
  readonly email: string | null;
  /** Phone. */
  readonly phone: string | null;
  /** JSON-serialised list of subjects. */
  readonly subjectsJson: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
