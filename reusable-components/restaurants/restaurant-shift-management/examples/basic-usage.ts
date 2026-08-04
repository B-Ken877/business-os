/**
 * Minimal usage example for the restaurant-shift-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRestaurantShiftManagementStore,
  createShift,
  addHandoffNotes,
} from "../backend";

async function main() {
  const store = new InMemoryRestaurantShiftManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "restaurant.shifts.manage",
        "restaurant.shifts.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    minShiftNoticeMinutes: 60,
  } };

  console.log("restaurant-shift-management ready.");
  console.log("Operations available:", ['createShift', 'addHandoffNotes'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
