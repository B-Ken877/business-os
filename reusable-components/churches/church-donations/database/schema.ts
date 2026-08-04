/**
 * Data model for church-donations.
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

export interface DonationRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly memberId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly fund: string;
  readonly method: string;
  readonly paymentReference: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PledgeRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly memberId: string;
  readonly targetAmountCents: number;
  readonly currency: string;
  readonly fund: string;
  readonly dueDate: string;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "DonationRow", columns: ["tenant_id", "id"], unique: true },
  { table: "PledgeRow", columns: ["tenant_id", "id"], unique: true },
] as const;
