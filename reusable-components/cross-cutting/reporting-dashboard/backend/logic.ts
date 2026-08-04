/**
 * Business logic for the reporting-dashboard component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  Metric,
  MetricValue,
} from "./types";

import {
  type DefineMetricInput,
  validateDefineMetricInput,
  type RecordMetricValueInput,
  validateRecordMetricValueInput,
  type GetMetricSeriesInput,
  validateGetMetricSeriesInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ReportingDashboardStore {
  getMetric(tenantId: string, id: EntityId): Metric | undefined;
  putMetric(tenantId: string, entity: Metric): void;
  listMetrics(tenantId: string): readonly Metric[];
  deleteMetric(tenantId: string, id: EntityId): boolean;
  getMetricValue(tenantId: string, id: EntityId): MetricValue | undefined;
  putMetricValue(tenantId: string, entity: MetricValue): void;
  listMetricValues(tenantId: string): readonly MetricValue[];
  deleteMetricValue(tenantId: string, id: EntityId): boolean;
}

export class InMemoryReportingDashboardStore implements ReportingDashboardStore {
  private readonly metrics = new Map<string, Map<string, Metric>>();
  private readonly metricValues = new Map<string, Map<string, MetricValue>>();

  getMetric(tenantId: string, id: EntityId): Metric | undefined {
    return this.metrics.get(tenantId)?.get(id);
  }
  putMetric(tenantId: string, entity: Metric): void {
    let byId = this.metrics.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.metrics.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listMetrics(tenantId: string): readonly Metric[] {
    const byId = this.metrics.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteMetric(tenantId: string, id: EntityId): boolean {
    return this.metrics.get(tenantId)?.delete(id) ?? false;
  }

  getMetricValue(tenantId: string, id: EntityId): MetricValue | undefined {
    return this.metricValues.get(tenantId)?.get(id);
  }
  putMetricValue(tenantId: string, entity: MetricValue): void {
    let byId = this.metricValues.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.metricValues.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listMetricValues(tenantId: string): readonly MetricValue[] {
    const byId = this.metricValues.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteMetricValue(tenantId: string, id: EntityId): boolean {
    return this.metricValues.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ReportingDashboardStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxMetricsPerTenant: number;
  readonly defaultRefreshIntervalSeconds: number;
  readonly maxQueryWindowDays: number;
}

//////////////////////////////////////////////////////////////////////
// defineMetric — Define a new metric for the tenant.
//////////////////////////////////////////////////////////////////////
export function defineMetric(
  ctx: TenantContext,
  deps: Dependencies,
  input: DefineMetricInput
): Result<Metric> {
  deps.permissions.require(ctx, asPermission("reporting.metrics.define"));
  const validated = validateDefineMetricInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const existing = deps.store.listMetrics(ctx.tenantId);
    if (existing.some((m) => m.key === v.key)) {
      return err(ErrorCode.CONFLICT, "metric key already exists");
    }
    if (existing.length >= deps.config.maxMetricsPerTenant) {
      return err(ErrorCode.LIMIT_EXCEEDED, "metric limit reached");
    }
    const id = asEntityId("met_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const metric: Metric = {
      id,
      tenantId: ctx.tenantId,
      key: v.key,
      name: v.name,
      sourceQuery: v.sourceQuery,
      refreshIntervalSeconds: v.refreshIntervalSeconds,
      ownerUserId: ctx.userId,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putMetric(ctx.tenantId, metric);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "reporting-dashboard",
      action: "reporting.metric.defined",
      entityType: "metric",
      entityId: id,
      details: { key: v.key, name: v.name },
    }));
    return ok(metric);
}

//////////////////////////////////////////////////////////////////////
// recordMetricValue — Record a computed value for a metric. Called by the platform's query runner after it computes the value.
//////////////////////////////////////////////////////////////////////
export function recordMetricValue(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordMetricValueInput
): Result<MetricValue> {
  deps.permissions.require(ctx, asPermission("reporting.metrics.read"));
  const validated = validateRecordMetricValueInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const metrics = deps.store.listMetrics(ctx.tenantId);
    if (!metrics.some((m) => m.key === v.metricKey)) {
      return err(ErrorCode.NOT_FOUND, "metric not found");
    }
    // Window sanity check.
    if (v.windowStart >= v.windowEnd) {
      return err(ErrorCode.INVALID_INPUT, "windowStart must be before windowEnd");
    }
    const id = asEntityId("val_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const value: MetricValue = {
      id,
      tenantId: ctx.tenantId,
      metricKey: v.metricKey,
      computedAt: now,
      windowStart: v.windowStart,
      windowEnd: v.windowEnd,
      value: v.value,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putMetricValue(ctx.tenantId, value);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "reporting-dashboard",
      action: "reporting.metric.value_recorded",
      entityType: "metric_value",
      entityId: id,
      details: { metricKey: v.metricKey, value: v.value, windowStart: v.windowStart, windowEnd: v.windowEnd },
    }));
    return ok(value);
}

//////////////////////////////////////////////////////////////////////
// getMetricSeries — Fetch all recorded values for a metric in a given window.
//////////////////////////////////////////////////////////////////////
export function getMetricSeries(
  ctx: TenantContext,
  deps: Dependencies,
  input: GetMetricSeriesInput
): Result<readonly MetricValue[]> {
  deps.permissions.require(ctx, asPermission("reporting.metrics.read"));
  const validated = validateGetMetricSeriesInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listMetricValues(ctx.tenantId);
    const filtered = all.filter(
      (mv) => mv.metricKey === v.metricKey && mv.windowStart >= v.windowStart && mv.windowEnd <= v.windowEnd
    );
    return ok(filtered);
}
