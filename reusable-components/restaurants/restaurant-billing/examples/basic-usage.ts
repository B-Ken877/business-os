/**
 * Minimal usage example for the restaurant-billing component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantBillingStore,
  generateBill,
  markPaid,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantBillingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.billing.generate",
        "restaurant.billing.read",
        "restaurant.billing.record_payment",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultServiceChargeBps: 0,
    defaultTaxBps: 1000,
  } };

  console.log("restaurant-billing ready.");
  console.log("Operations available:", ['generateBill', 'markPaid'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
