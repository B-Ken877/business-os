import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryReportingDashboardStore,
  defineMetric,
  recordMetricValue,
  getMetricSeries,
  defaultConfig,
  type Metric,
  type MetricValue,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryReportingDashboardStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "reporting.metrics.define",
    "reporting.metrics.read",
    "reporting.metrics.delete",
    "reporting.dashboards.manage",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("reporting-dashboard / defineMetric", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      defineMetric(ctx, denyDeps, { key: "value", name: "value", sourceQuery: "value", refreshIntervalSeconds: 1 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("reporting-dashboard / recordMetricValue", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordMetricValue(ctx, denyDeps, { metricKey: "value", windowStart: "2024-01-15", windowEnd: "2024-01-15", value: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("reporting-dashboard / getMetricSeries", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      getMetricSeries(ctx, denyDeps, { metricKey: "value", windowStart: "2024-01-15", windowEnd: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("reporting-dashboard / defineMetric happy path", () => {
  it("defines a metric and rejects duplicate keys", () => {
    const { ctx, deps } = setup();
    const r1 = defineMetric(ctx, deps, {
      key: "daily_sales",
      name: "Daily Sales",
      sourceQuery: "retail.daily_sales",
      refreshIntervalSeconds: 60,
    });
    expect(isOk(r1)).toBe(true);
    const r2 = defineMetric(ctx, deps, {
      key: "daily_sales",
      name: "Daily Sales",
      sourceQuery: "retail.daily_sales",
      refreshIntervalSeconds: 60,
    });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("CONFLICT");
  });
});

describe("reporting-dashboard / recordMetricValue rules", () => {
  it("records a value for an existing metric", () => {
    const { ctx, deps } = setup();
    defineMetric(ctx, deps, {
      key: "daily_sales",
      name: "Daily Sales",
      sourceQuery: "retail.daily_sales",
      refreshIntervalSeconds: 60,
    });
    const r = recordMetricValue(ctx, deps, {
      metricKey: "daily_sales",
      windowStart: "2024-01-01",
      windowEnd: "2024-01-02",
      value: 1500,
    });
    expect(isOk(r)).toBe(true);
  });

  it("rejects recording a value for a non-existent metric", () => {
    const { ctx, deps } = setup();
    const r = recordMetricValue(ctx, deps, {
      metricKey: "missing",
      windowStart: "2024-01-01",
      windowEnd: "2024-01-02",
      value: 0,
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });

  it("rejects inverted windows", () => {
    const { ctx, deps } = setup();
    defineMetric(ctx, deps, {
      key: "daily_sales",
      name: "Daily Sales",
      sourceQuery: "retail.daily_sales",
      refreshIntervalSeconds: 60,
    });
    const r = recordMetricValue(ctx, deps, {
      metricKey: "daily_sales",
      windowStart: "2024-01-02",
      windowEnd: "2024-01-01",
      value: 0,
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
