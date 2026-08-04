/**
 * Minimal usage example for the service-customer-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceCustomerManagementStore,
  createCustomer,
  setPreferences,
} from "../backend";

async function main() {
  const store = new InMemoryServiceCustomerManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.customers.create",
        "service.customers.update",
        "service.customers.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxCustomersPerTenant: 50000,
  } };

  console.log("service-customer-management ready.");
  console.log("Operations available:", ['createCustomer', 'setPreferences'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
