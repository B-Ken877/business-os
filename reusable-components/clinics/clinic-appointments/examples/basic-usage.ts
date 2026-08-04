/**
 * Minimal usage example for the clinic-appointments component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicAppointmentsStore,
  scheduleAppointment,
  cancelAppointment,
} from "../backend";

async function main() {
  const store = new InMemoryClinicAppointmentsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.appointments.schedule",
        "clinic.appointments.read",
        "clinic.appointments.cancel",
        "clinic.appointments.reschedule",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    slotDurationMinutes: 30,
    reminderLeadMinutes: 60,
  } };

  console.log("clinic-appointments ready.");
  console.log("Operations available:", ['scheduleAppointment', 'cancelAppointment'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
