/**
 * Minimal usage example for the school-exams component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolExamsStore,
  createExam,
  markExamGraded,
} from "../backend";

async function main() {
  const store = new InMemorySchoolExamsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.exams.manage",
        "school.exams.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultExamWindowDays: 7,
  } };

  console.log("school-exams ready.");
  console.log("Operations available:", ['createExam', 'markExamGraded'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
