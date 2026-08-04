/**
 * Domain types for the church-attendance component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// ServiceAttendance
//////////////////////////////////////////////////////////////////////
/** A single attendance record for a service. */
export interface ServiceAttendance {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Member who attended (or was absent). */
  readonly memberId: string;
  /** ISO-8601 date of the service. */
  readonly serviceDate: string;
  /** True if present, false if absent. */
  readonly attended: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}
