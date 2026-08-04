/**
 * Domain types for the retail-customer-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Customer
//////////////////////////////////////////////////////////////////////
/** A retail customer. */
export interface Customer {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer name. */
  readonly name: string;
  /** Phone number. */
  readonly phone: string | null;
  /** Email address. */
  readonly email: string | null;
  /** Physical address. */
  readonly address: string | null;
  /** Free-form loyalty notes. */
  readonly loyaltyNotes: string | null;
  /** Customer status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
