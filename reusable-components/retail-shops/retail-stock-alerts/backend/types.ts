/**
 * Domain types for the retail-stock-alerts component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// StockAlert
//////////////////////////////////////////////////////////////////////
/** A stock alert that was emitted. */
export interface StockAlert {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The product this alert is for. */
  readonly productId: string;
  /** Type of alert. */
  readonly alertType: string;
  /** Stock level at the time of the alert. */
  readonly currentQuantity: number;
  /** Threshold that was crossed (0 for out_of_stock). */
  readonly threshold: number;
  /** Reference to the notification emitted. */
  readonly notificationId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
