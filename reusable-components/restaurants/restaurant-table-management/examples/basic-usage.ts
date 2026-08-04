/**
 * Minimal usage example for the restaurant-table-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantTableManagementStore,
  createTable,
  assignOrderToTable,
  releaseTable,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantTableManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.tables.manage",
        "restaurant.tables.read",
        "restaurant.tables.assign",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxTablesPerTenant: 100,
  } };

  console.log("restaurant-table-management ready.");
  console.log("Operations available:", ['createTable', 'assignOrderToTable', 'releaseTable'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
