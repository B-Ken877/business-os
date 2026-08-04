/**
 * Domain types for the school-class-scheduling component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// ClassSession
//////////////////////////////////////////////////////////////////////
/** A scheduled class session. */
export interface ClassSession {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Subject (e.g. 'Mathematics'). */
  readonly subject: string;
  /** Teacher assigned. */
  readonly teacherUserId: string;
  /** Room assigned. */
  readonly roomId: string;
  /** Day of week (1=Monday, 7=Sunday). */
  readonly dayOfWeek: number;
  /** Start hour (0-23). */
  readonly startHour: number;
  /** Start minute (0 or 30). */
  readonly startMinute: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
