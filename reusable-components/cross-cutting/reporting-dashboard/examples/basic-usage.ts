/**
 * Minimal usage example for the reporting-dashboard component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryReportingDashboardStore,
  defineMetric,
  recordMetricValue,
  getMetricSeries,
} from "../backend";

async function main() {
  const store = new InMemoryReportingDashboardStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "reporting.metrics.define",
        "reporting.metrics.read",
        "reporting.metrics.delete",
        "reporting.dashboards.manage",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxMetricsPerTenant: 50,
    defaultRefreshIntervalSeconds: 300,
    maxQueryWindowDays: 365,
  } };

  console.log("reporting-dashboard ready.");
  console.log("Operations available:", ['defineMetric', 'recordMetricValue', 'getMetricSeries'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
