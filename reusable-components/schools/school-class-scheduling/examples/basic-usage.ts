/**
 * Minimal usage example for the school-class-scheduling component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolClassSchedulingStore,
  scheduleSession,
  listSessionsForTeacher,
} from "../backend";

async function main() {
  const store = new InMemorySchoolClassSchedulingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.scheduling.manage",
        "school.scheduling.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    sessionDurationMinutes: 45,
  } };

  console.log("school-class-scheduling ready.");
  console.log("Operations available:", ['scheduleSession', 'listSessionsForTeacher'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
