/**
 * Domain types for the clinic-staff-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Staff
//////////////////////////////////////////////////////////////////////
/** A clinic staff member. */
export interface Staff {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** First name. */
  readonly firstName: string;
  /** Last name. */
  readonly lastName: string;
  /** Staff role. */
  readonly role: string;
  /** Medical specialty (for doctors). */
  readonly specialty: string | null;
  /** Phone. */
  readonly phone: string | null;
  /** Email. */
  readonly email: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
