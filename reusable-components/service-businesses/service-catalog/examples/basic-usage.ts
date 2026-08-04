/**
 * Minimal usage example for the service-catalog component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceCatalogStore,
  createService,
  listActiveServices,
} from "../backend";

async function main() {
  const store = new InMemoryServiceCatalogStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.catalog.manage",
        "service.catalog.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultCurrency: "HTG",
    maxServicesPerTenant: 1000,
  } };

  console.log("service-catalog ready.");
  console.log("Operations available:", ['createService', 'listActiveServices'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
