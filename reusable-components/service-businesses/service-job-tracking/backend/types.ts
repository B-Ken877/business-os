/**
 * Domain types for the service-job-tracking component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Job
//////////////////////////////////////////////////////////////////////
/** A service job. */
export interface Job {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Booking this job is for, or null. */
  readonly bookingId: string | null;
  /** Customer. */
  readonly customerId: string;
  /** Job title. */
  readonly title: string;
  /** Job status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// JobTask
//////////////////////////////////////////////////////////////////////
/** A task within a job. */
export interface JobTask {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Job this task belongs to. */
  readonly jobId: string;
  /** Task title. */
  readonly title: string;
  /** Execution order (1-based). */
  readonly order: number;
  /** Task status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
