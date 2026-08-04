/**
 * HTTP-shaped API contract for reporting-dashboard.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Metric, MetricValue } from "../backend/types";
import type { DefineMetricInput, RecordMetricValueInput, GetMetricSeriesInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/reporting-dashboard/define-metric",
    permission: "reporting.metrics.define",
    description: "Define a new metric for the tenant.",
  },
  {
    method: "POST",
    path: "/v1/reporting-dashboard/record-metric-value",
    permission: "reporting.metrics.read",
    description: "Record a computed value for a metric. Called by the platform's query runner after it computes the value.",
  },
  {
    method: "GET",
    path: "/v1/reporting-dashboard/get-metric-series",
    permission: "reporting.metrics.read",
    description: "Fetch all recorded values for a metric in a given window.",
  },
];
