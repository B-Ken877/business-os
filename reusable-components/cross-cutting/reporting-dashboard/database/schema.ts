/**
 * Data model for reporting-dashboard.
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

export interface MetricRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly key: string;
  readonly name: string;
  readonly sourceQuery: string;
  readonly refreshIntervalSeconds: number;
  readonly ownerUserId: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface MetricValueRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly metricKey: string;
  readonly computedAt: string;
  readonly windowStart: string;
  readonly windowEnd: string;
  readonly value: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "MetricRow", columns: ["tenant_id", "id"], unique: true },
  { table: "MetricValueRow", columns: ["tenant_id", "id"], unique: true },
] as const;
