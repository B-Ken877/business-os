/**
 * Minimal usage example for the school-tuition-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolTuitionManagementStore,
  createTuitionPlan,
  recordTuitionPayment,
  computeOutstandingBalance,
} from "../backend";

async function main() {
  const store = new InMemorySchoolTuitionManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.tuition.manage",
        "school.tuition.read",
        "school.tuition.record_payment",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultPlanInstallments: 10,
  } };

  console.log("school-tuition-management ready.");
  console.log("Operations available:", ['createTuitionPlan', 'recordTuitionPayment', 'computeOutstandingBalance'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
