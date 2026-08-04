/**
 * Data model for service-scheduling.
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

export interface StaffAvailabilityRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly staffUserId: string;
  readonly dayOfWeek: number;
  readonly startHour: number;
  readonly endHour: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface TimeOffRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly staffUserId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly reason: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "StaffAvailabilityRow", columns: ["tenant_id", "id"], unique: true },
  { table: "TimeOffRow", columns: ["tenant_id", "id"], unique: true },
] as const;
