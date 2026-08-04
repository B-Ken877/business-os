/**
 * Domain types for the retail-inventory component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// StockLevel
//////////////////////////////////////////////////////////////////////
/** Current stock level for a product. */
export interface StockLevel {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The product this stock level is for. */
  readonly productId: string;
  /** Current quantity on hand. */
  readonly quantity: number;
  /** Threshold below which an alert fires. */
  readonly lowStockThreshold: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// StockMovement
//////////////////////////////////////////////////////////////////////
/** A single stock movement event. */
export interface StockMovement {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The product this movement is for. */
  readonly productId: string;
  /** Change in quantity (positive for in, negative for out). */
  readonly delta: number;
  /** Why the movement happened (e.g. 'restock', 'sale', 'shrinkage'). */
  readonly reason: string;
  /** Optional reference (e.g. sale id, supplier invoice). */
  readonly reference: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
