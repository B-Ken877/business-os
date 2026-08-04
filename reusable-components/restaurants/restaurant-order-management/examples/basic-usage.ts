/**
 * Minimal usage example for the restaurant-order-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantOrderManagementStore,
  createOrder,
  advanceOrderStatus,
  cancelOrder,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantOrderManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.orders.create",
        "restaurant.orders.update_status",
        "restaurant.orders.read",
        "restaurant.orders.cancel",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxItemsPerOrder: 50,
    defaultFulfillmentType: "dine_in",
  } };

  console.log("restaurant-order-management ready.");
  console.log("Operations available:", ['createOrder', 'advanceOrderStatus', 'cancelOrder'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
