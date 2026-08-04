/**
 * Minimal usage example for the clinic-reminders component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicRemindersStore,
  scheduleReminder,
  cancelReminder,
} from "../backend";

async function main() {
  const store = new InMemoryClinicRemindersStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.reminders.schedule",
        "clinic.reminders.read",
        "clinic.reminders.cancel",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultReminderLeadMinutes: 60,
  } };

  console.log("clinic-reminders ready.");
  console.log("Operations available:", ['scheduleReminder', 'cancelReminder'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
