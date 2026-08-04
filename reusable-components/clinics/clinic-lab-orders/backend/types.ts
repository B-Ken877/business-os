/**
 * Domain types for the clinic-lab-orders component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// LabOrder
//////////////////////////////////////////////////////////////////////
/** A lab test order. */
export interface LabOrder {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Ordering doctor. */
  readonly doctorStaffId: string;
  /** Test name (e.g. 'CBC'). */
  readonly testName: string;
  /** Order status. */
  readonly status: string;
  /** Document id of the result, when available. */
  readonly resultDocumentId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
