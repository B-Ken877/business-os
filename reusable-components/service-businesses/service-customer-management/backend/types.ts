/**
 * Domain types for the service-customer-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Customer
//////////////////////////////////////////////////////////////////////
/** A service customer. */
export interface Customer {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer name. */
  readonly name: string;
  /** Phone. */
  readonly phone: string | null;
  /** Email. */
  readonly email: string | null;
  /** Address. */
  readonly address: string | null;
  /** JSON-serialised preferences. */
  readonly preferencesJson: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
