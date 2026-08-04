/**
 * Data model for school-grading.
 *
 * This file declares the entities the component owns. Other
 * components must not read or write these tables directly — they go
 * through the public API exported from `backend/index.ts`.
 *
 * A persistence adapter (Postgres, SQLite, etc.) will translate these
 * types into actual schema migrations when the platform's database
 * layer is built. Until then, the types are the canonical model.
 */

import type { EntityId, TenantId } from "@business-os/shared";

export interface GradeRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly studentId: string;
  readonly assessmentId: string;
  readonly scorePct: number;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface AssessmentRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly name: string;
  readonly subject: string;
  readonly maxScorePct: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "GradeRow", columns: ["tenant_id", "id"], unique: true },
  { table: "AssessmentRow", columns: ["tenant_id", "id"], unique: true },
] as const;
