/**
 * Minimal usage example for the retail-customer-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailCustomerManagementStore,
  createCustomer,
  updateStatus,
  addLoyaltyNote,
} from "../backend";

async function main() {
  const store = new InMemoryRetailCustomerManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.customers.create",
        "retail.customers.update",
        "retail.customers.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxCustomersPerTenant: 100000,
  } };

  console.log("retail-customer-management ready.");
  console.log("Operations available:", ['createCustomer', 'updateStatus', 'addLoyaltyNote'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
