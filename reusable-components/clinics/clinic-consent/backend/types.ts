/**
 * Domain types for the clinic-consent component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// ConsentRecord
//////////////////////////////////////////////////////////////////////
/** A patient's consent for a specific data use. */
export interface ConsentRecord {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Purpose of data use (e.g. 'treatment', 'sharing', 'research'). */
  readonly purpose: string;
  /** ISO-8601 grant timestamp. */
  readonly grantedAt: string;
  /** ISO-8601 revocation timestamp, or null if active. */
  readonly revokedAt: string | null;
  /** Reason for revocation, if revoked. */
  readonly revokeReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
