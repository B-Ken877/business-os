/**
 * Domain types for the school-exams component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Exam
//////////////////////////////////////////////////////////////////////
/** An exam period. */
export interface Exam {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Exam name (e.g. 'Q2 Midterm'). */
  readonly name: string;
  /** Academic period (e.g. 'Q2 2024-2025'). */
  readonly period: string;
  /** ISO-8601 exam window start. */
  readonly startsAt: string;
  /** ISO-8601 exam window end. */
  readonly endsAt: string;
  /** Exam status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
