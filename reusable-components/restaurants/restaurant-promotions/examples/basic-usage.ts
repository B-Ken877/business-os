/**
 * Minimal usage example for the restaurant-promotions component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantPromotionsStore,
  createCoupon,
  redeemCoupon,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantPromotionsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.promotions.manage",
        "restaurant.promotions.read",
        "restaurant.promotions.redeem",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxActiveCoupons: 50,
  } };

  console.log("restaurant-promotions ready.");
  console.log("Operations available:", ['createCoupon', 'redeemCoupon'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
