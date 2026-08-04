/**
 * Minimal usage example for the retail-product-catalog component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailProductCatalogStore,
  createProduct,
  updatePrice,
  archiveProduct,
} from "../backend";

async function main() {
  const store = new InMemoryRetailProductCatalogStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.products.create",
        "retail.products.update",
        "retail.products.archive",
        "retail.products.read",
        "retail.categories.manage",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxProductsPerTenant: 50000,
    maxCategoriesPerTenant: 200,
    defaultCurrency: "HTG",
  } };

  console.log("retail-product-catalog ready.");
  console.log("Operations available:", ['createProduct', 'updatePrice', 'archiveProduct'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
