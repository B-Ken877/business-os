/**
 * HTTP-shaped API contract for retail-sales-reports.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { SaleRecord, DailySalesSummary } from "../backend/types";
import type { ComputeDailySummaryInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-sales-reports/compute-daily-summary",
    permission: "retail.reports.read",
    description: "Compute the daily sales summary for a given date, based on the sales recorded by the POS.",
  },
];
