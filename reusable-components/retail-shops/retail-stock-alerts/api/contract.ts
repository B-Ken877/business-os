/**
 * HTTP-shaped API contract for retail-stock-alerts.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { StockAlert } from "../backend/types";
import type { EvaluateStockLevelInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-stock-alerts/evaluate-stock-level",
    permission: "retail.stockalerts.evaluate",
    description: "Evaluate a single product's stock level and emit an alert if it has crossed a threshold. Suppresses duplicates within the configured window.",
  },
  {
    method: "GET",
    path: "/v1/retail-stock-alerts/list-active-alerts",
    permission: "retail.stockalerts.read",
    description: "List all alerts emitted in the last 24 hours, newest first.",
  },
];
