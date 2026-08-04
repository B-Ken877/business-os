/**
 * Minimal usage example for the retail-stock-alerts component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailStockAlertsStore,
  evaluateStockLevel,
  listActiveAlerts,
} from "../backend";

async function main() {
  const store = new InMemoryRetailStockAlertsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.stockalerts.evaluate",
        "retail.stockalerts.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    suppressDuplicateHours: 6,
    alertRecipientRole: "manager",
  } };

  console.log("retail-stock-alerts ready.");
  console.log("Operations available:", ['evaluateStockLevel', 'listActiveAlerts'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
