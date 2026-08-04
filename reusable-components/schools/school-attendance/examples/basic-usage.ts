/**
 * Minimal usage example for the school-attendance component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolAttendanceStore,
  recordAttendance,
  computeAttendanceRate,
} from "../backend";

async function main() {
  const store = new InMemorySchoolAttendanceStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.attendance.record",
        "school.attendance.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    chronicAbsenceThresholdPct: 20,
  } };

  console.log("school-attendance ready.");
  console.log("Operations available:", ['recordAttendance', 'computeAttendanceRate'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
