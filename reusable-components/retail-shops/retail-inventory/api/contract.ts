/**
 * HTTP-shaped API contract for retail-inventory.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { StockLevel, StockMovement } from "../backend/types";
import type { AdjustStockInput, SetLowStockThresholdInput, ListMovementsForProductInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "PATCH",
    path: "/v1/retail-inventory/adjust-stock",
    permission: "retail.inventory.adjust",
    description: "Adjust stock by a delta (positive or negative). Records a movement.",
  },
  {
    method: "POST",
    path: "/v1/retail-inventory/set-low-stock-threshold",
    permission: "retail.inventory.thresholds.manage",
    description: "Set the low-stock threshold for a product.",
  },
  {
    method: "GET",
    path: "/v1/retail-inventory/list-movements-for-product",
    permission: "retail.inventory.read",
    description: "List all stock movements for a product, newest first.",
  },
];
