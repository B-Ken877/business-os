/**
 * Data model for restaurant-order-management.
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

export interface OrderRow {
  readonly id: EntityId;
  readonly tenant_id: TenantId;
  readonly itemsJson: string;
  readonly fulfillmentType: string;
  readonly tableId: string | null;
  readonly deliveryAddress: string | null;
  readonly specialInstructions: string | null;
  readonly status: string;
  readonly created_at: string;
  readonly updated_at: string;
}

/**
 * Recommended indexes (declarative — applied by the future DB adapter).
 */
export const recommendedIndexes = [
  { table: "OrderRow", columns: ["tenant_id", "id"], unique: true },
] as const;
