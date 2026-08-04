/**
 * Minimal usage example for the church-attendance component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchAttendanceStore,
  recordAttendance,
  isDeclining,
} from "../backend";

async function main() {
  const store = new InMemoryChurchAttendanceStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.attendance.record",
        "church.attendance.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    declineThresholdWeeks: 3,
  } };

  console.log("church-attendance ready.");
  console.log("Operations available:", ['recordAttendance', 'isDeclining'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
