/**
 * Minimal usage example for the clinic-prescriptions component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicPrescriptionsStore,
  createPrescription,
  refillPrescription,
} from "../backend";

async function main() {
  const store = new InMemoryClinicPrescriptionsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.prescriptions.create",
        "clinic.prescriptions.read",
        "clinic.prescriptions.refill",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxRefillsAllowed: 3,
  } };

  console.log("clinic-prescriptions ready.");
  console.log("Operations available:", ['createPrescription', 'refillPrescription'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
