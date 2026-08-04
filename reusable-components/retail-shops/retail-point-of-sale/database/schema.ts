/**
 * Data model for retail-point-of-sale.
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

export interface SaleRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly cartJson: string;
  readonly subtotalCents: number;
  readonly discountCents: number;
  readonly taxCents: number;
  readonly totalCents: number;
  readonly currency: string;
  readonly paymentId: string | null;
  readonly receiptDocumentId: string | null;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "SaleRow", columns: ["tenant_id", "id"], unique: true },
] as const;
