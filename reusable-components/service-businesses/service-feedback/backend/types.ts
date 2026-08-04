/**
 * Domain types for the service-feedback component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Feedback
//////////////////////////////////////////////////////////////////////
/** Customer feedback. */
export interface Feedback {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer. */
  readonly customerId: string;
  /** Booking the feedback is for. */
  readonly bookingId: string;
  /** Rating 1-5. */
  readonly rating: number;
  /** Free-form comment. */
  readonly comment: string | null;
  /** Feedback status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
