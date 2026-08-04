/**
 * Data model for retail-sales-reports.
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

export interface SaleRecordRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly totalCents: number;
  readonly discountCents: number;
  readonly taxCents: number;
  readonly currency: string;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface DailySalesSummaryRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly date: string;
  readonly totalSalesCount: number;
  readonly totalRevenueCents: number;
  readonly totalDiscountCents: number;
  readonly totalTaxCents: number;
  readonly averageBasketCents: number;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "SaleRecordRow", columns: ["tenant_id", "id"], unique: true },
  { table: "DailySalesSummaryRow", columns: ["tenant_id", "id"], unique: true },
] as const;
