/**
 * Minimal usage example for the restaurant-kitchen-display component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantKitchenDisplayStore,
  createTicket,
  markTicketReady,
  listTicketsForStation,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantKitchenDisplayStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.kitchen.tickets.read",
        "restaurant.kitchen.tickets.update",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxTicketsPerStation: 50,
  } };

  console.log("restaurant-kitchen-display ready.");
  console.log("Operations available:", ['createTicket', 'markTicketReady', 'listTicketsForStation'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
