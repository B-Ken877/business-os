/**
 * Minimal usage example for the school-student-enrollment component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolStudentEnrollmentStore,
  enrollStudent,
  updateEnrollmentStatus,
} from "../backend";

async function main() {
  const store = new InMemorySchoolStudentEnrollmentStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.students.create",
        "school.students.update",
        "school.students.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxStudentsPerTenant: 10000,
  } };

  console.log("school-student-enrollment ready.");
  console.log("Operations available:", ['enrollStudent', 'updateEnrollmentStatus'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
