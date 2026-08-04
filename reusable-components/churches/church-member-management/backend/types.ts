/**
 * Domain types for the church-member-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Member
//////////////////////////////////////////////////////////////////////
/** A church member. */
export interface Member {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** First name. */
  readonly firstName: string;
  /** Last name. */
  readonly lastName: string;
  /** Phone. */
  readonly phone: string | null;
  /** Email. */
  readonly email: string | null;
  /** Family/household identifier. */
  readonly familyId: string | null;
  /** Membership status. */
  readonly membershipStatus: string;
  /** Whether the member appears in the directory. */
  readonly directoryVisibility: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
