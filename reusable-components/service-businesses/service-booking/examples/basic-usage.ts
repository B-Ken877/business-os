/**
 * Minimal usage example for the service-booking component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceBookingStore,
  createBooking,
  markCompleted,
  markNoShow,
} from "../backend";

async function main() {
  const store = new InMemoryServiceBookingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.bookings.create",
        "service.bookings.read",
        "service.bookings.update_status",
        "service.bookings.cancel",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    slotGranularityMinutes: 15,
  } };

  console.log("service-booking ready.");
  console.log("Operations available:", ['createBooking', 'markCompleted', 'markNoShow'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
