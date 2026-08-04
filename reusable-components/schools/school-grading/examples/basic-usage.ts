/**
 * Minimal usage example for the school-grading component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolGradingStore,
  recordGrade,
  computeStudentAverage,
} from "../backend";

async function main() {
  const store = new InMemorySchoolGradingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.grades.record",
        "school.grades.read",
        "school.grades.manage_assessments",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    passingGradePct: 60,
  } };

  console.log("school-grading ready.");
  console.log("Operations available:", ['recordGrade', 'computeStudentAverage'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
