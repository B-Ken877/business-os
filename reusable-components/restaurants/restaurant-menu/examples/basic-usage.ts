/**
 * Minimal usage example for the restaurant-menu component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantMenuStore,
  createMenuItem,
  setAvailability,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantMenuStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.menu.items.manage",
        "restaurant.menu.items.read",
        "restaurant.menu.availability.manage",
        "restaurant.menu.categories.manage",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultCurrency: "HTG",
    maxItemsPerTenant: 1000,
    maxModifiersPerItem: 20,
  } };

  console.log("restaurant-menu ready.");
  console.log("Operations available:", ['createMenuItem', 'setAvailability'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
