/**
 * Data model for retail-supplier-management.
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

export interface SupplierRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly name: string;
  readonly contactName: string | null;
  readonly phone: string | null;
  readonly email: string | null;
  readonly address: string | null;
  readonly paymentTermsDays: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PurchaseOrderRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly supplierId: string;
  readonly itemsJson: string;
  readonly totalCents: number;
  readonly currency: string;
  readonly status: string;
  readonly receivedAt: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "SupplierRow", columns: ["tenant_id", "id"], unique: true },
  { table: "PurchaseOrderRow", columns: ["tenant_id", "id"], unique: true },
] as const;
