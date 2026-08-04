/**
 * Minimal usage example for the school-teacher-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolTeacherManagementStore,
  createTeacher,
  listTeachers,
} from "../backend";

async function main() {
  const store = new InMemorySchoolTeacherManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.teachers.manage",
        "school.teachers.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxWorkloadHoursPerWeek: 30,
  } };

  console.log("school-teacher-management ready.");
  console.log("Operations available:", ['createTeacher', 'listTeachers'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
