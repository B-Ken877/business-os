/**
 * Data model for retail-product-catalog.
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

export interface CategoryRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly name: string;
  readonly description: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface ProductRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly name: string;
  readonly sku: string;
  readonly categoryId: string;
  readonly priceCents: number;
  readonly currency: string;
  readonly description: string | null;
  readonly photoDocumentId: string | null;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "CategoryRow", columns: ["tenant_id", "id"], unique: true },
  { table: "ProductRow", columns: ["tenant_id", "id"], unique: true },
] as const;
