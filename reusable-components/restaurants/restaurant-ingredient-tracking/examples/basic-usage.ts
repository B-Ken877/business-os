/**
 * Minimal usage example for the restaurant-ingredient-tracking component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantIngredientTrackingStore,
  addIngredientStock,
  depleteForMenuItem,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantIngredientTrackingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.ingredients.manage",
        "restaurant.ingredients.read",
        "restaurant.recipes.manage",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultLowIngredientThreshold: 2,
  } };

  console.log("restaurant-ingredient-tracking ready.");
  console.log("Operations available:", ['addIngredientStock', 'depleteForMenuItem'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
