/**
 * Minimal usage example for the clinic-lab-orders component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicLabOrdersStore,
  orderLabTest,
  recordResult,
} from "../backend";

async function main() {
  const store = new InMemoryClinicLabOrdersStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.lab.order",
        "clinic.lab.read",
        "clinic.lab.record_result",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultResultTurnaroundHours: 24,
  } };

  console.log("clinic-lab-orders ready.");
  console.log("Operations available:", ['orderLabTest', 'recordResult'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
