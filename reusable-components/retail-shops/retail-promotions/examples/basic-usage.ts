/**
 * Minimal usage example for the retail-promotions component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailPromotionsStore,
  createPromotion,
  activatePromotion,
  listActivePromotions,
} from "../backend";

async function main() {
  const store = new InMemoryRetailPromotionsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.promotions.create",
        "retail.promotions.update",
        "retail.promotions.activate",
        "retail.promotions.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxActivePromotionsPerTenant: 20,
  } };

  console.log("retail-promotions ready.");
  console.log("Operations available:", ['createPromotion', 'activatePromotion', 'listActivePromotions'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
