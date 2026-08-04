/**
 * Domain types for the reporting-dashboard component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Metric
//////////////////////////////////////////////////////////////////////
/** A named, scheduled metric definition. */
export interface Metric {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Stable identifier used in queries and dashboards. */
  readonly key: string;
  /** Human-readable name. */
  readonly name: string;
  /** Opaque query identifier the platform's query runner understands (e.g. 'retail.daily_sales'). */
  readonly sourceQuery: string;
  /** How often the metric should be recomputed. */
  readonly refreshIntervalSeconds: number;
  /** User who owns this metric definition. */
  readonly ownerUserId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// MetricValue
//////////////////////////////////////////////////////////////////////
/** A single computed data point for a metric. */
export interface MetricValue {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The metric this value belongs to. */
  readonly metricKey: string;
  /** ISO-8601 timestamp the value was computed. */
  readonly computedAt: string;
  /** ISO-8601 timestamp of the start of the window. */
  readonly windowStart: string;
  /** ISO-8601 timestamp of the end of the window. */
  readonly windowEnd: string;
  /** The computed metric value. */
  readonly value: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
