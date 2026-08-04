/**
 * Minimal usage example for the restaurant-delivery-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantDeliveryManagementStore,
  assignDriver,
  confirmDelivered,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantDeliveryManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.delivery.assign",
        "restaurant.delivery.update",
        "restaurant.delivery.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxActiveDeliveriesPerDriver: 3,
  } };

  console.log("restaurant-delivery-management ready.");
  console.log("Operations available:", ['assignDriver', 'confirmDelivered'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
