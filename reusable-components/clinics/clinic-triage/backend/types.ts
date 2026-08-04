/**
 * Domain types for the clinic-triage component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// TriageEntry
//////////////////////////////////////////////////////////////////////
/** A triage entry. */
export interface TriageEntry {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Patient-stated reason for visit. */
  readonly visitReason: string;
  /** JSON-serialised list of symptoms. */
  readonly symptomsJson: string | null;
  /** Classified urgency. */
  readonly urgency: string;
  /** Staff who classified the urgency. */
  readonly classifiedByStaffId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
