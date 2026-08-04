/**
 * Minimal usage example for the school-student-portal component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolStudentPortalStore,
  startSession,
  endSession,
} from "../backend";

async function main() {
  const store = new InMemorySchoolStudentPortalStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.portal.student.view",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    allowStudentMessageReply: false,
  } };

  console.log("school-student-portal ready.");
  console.log("Operations available:", ['startSession', 'endSession'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
