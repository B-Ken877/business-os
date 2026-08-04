/**
 * Minimal usage example for the restaurant-reservations component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantReservationsStore,
  createReservation,
  cancelReservation,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantReservationsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.reservations.create",
        "restaurant.reservations.read",
        "restaurant.reservations.cancel",
        "restaurant.reservations.checkin",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxReservationsPerDay: 200,
    reminderLeadMinutes: 60,
  } };

  console.log("restaurant-reservations ready.");
  console.log("Operations available:", ['createReservation', 'cancelReservation'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
