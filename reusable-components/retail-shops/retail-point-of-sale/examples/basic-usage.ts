/**
 * Minimal usage example for the retail-point-of-sale component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailPointOfSaleStore,
  checkout,
  getSale,
} from "../backend";

async function main() {
  const store = new InMemoryRetailPointOfSaleStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.pos.checkout",
        "retail.pos.refund",
        "retail.pos.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultTaxRateBps: 1000,
    currency: "HTG",
    allowNegativeCartTotal: false,
  } };

  console.log("retail-point-of-sale ready.");
  console.log("Operations available:", ['checkout', 'getSale'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
