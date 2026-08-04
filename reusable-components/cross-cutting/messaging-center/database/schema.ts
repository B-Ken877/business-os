/**
 * Data model for messaging-center.
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

export interface MessageRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly recipientId: string;
  readonly channel: string;
  readonly templateKey: string;
  readonly variables: Readonly<Record<string, string>> | null;
  readonly status: string;
  readonly sentAt: string | null;
  readonly deliveredAt: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "MessageRow", columns: ["tenant_id", "id"], unique: true },
] as const;
