/**
 * Domain types for the school-student-portal component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// StudentPortalSession
//////////////////////////////////////////////////////////////////////
/** A student portal session. */
export interface StudentPortalSession {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The student using the portal. */
  readonly studentId: string;
  /** ISO-8601 session start. */
  readonly startedAt: string;
  /** Session status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
