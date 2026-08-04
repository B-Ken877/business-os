/**
 * Minimal usage example for the retail-sales-reports component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailSalesReportsStore,
  computeDailySummary,
} from "../backend";

async function main() {
  const store = new InMemoryRetailSalesReportsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.reports.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    topN: 10,
  } };

  console.log("retail-sales-reports ready.");
  console.log("Operations available:", ['computeDailySummary'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
