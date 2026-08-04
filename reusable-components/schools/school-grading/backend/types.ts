/**
 * Domain types for the school-grading component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Grade
//////////////////////////////////////////////////////////////////////
/** A single grade entry. */
export interface Grade {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Student this grade is for. */
  readonly studentId: string;
  /** The assessment this grade belongs to. */
  readonly assessmentId: string;
  /** Score as a percentage (0-100). */
  readonly scorePct: number;
  /** Teacher notes. */
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// Assessment
//////////////////////////////////////////////////////////////////////
/** An assessment (exam, quiz, project). */
export interface Assessment {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Assessment name (e.g. 'Midterm Exam'). */
  readonly name: string;
  /** Subject (e.g. 'Mathematics'). */
  readonly subject: string;
  /** Maximum possible score (usually 100). */
  readonly maxScorePct: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
