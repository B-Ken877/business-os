/**
 * Minimal usage example for the retail-inventory component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailInventoryStore,
  adjustStock,
  setLowStockThreshold,
  listMovementsForProduct,
} from "../backend";

async function main() {
  const store = new InMemoryRetailInventoryStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.inventory.read",
        "retail.inventory.adjust",
        "retail.inventory.restock",
        "retail.inventory.thresholds.manage",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultLowStockThreshold: 5,
    allowNegativeStock: false,
    maxMovementsPerProduct: 10000,
  } };

  console.log("retail-inventory ready.");
  console.log("Operations available:", ['adjustStock', 'setLowStockThreshold', 'listMovementsForProduct'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
