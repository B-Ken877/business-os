/**
 * Minimal usage example for the clinic-patient-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicPatientManagementStore,
  createPatient,
  getPatient,
} from "../backend";

async function main() {
  const store = new InMemoryClinicPatientManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.patients.create",
        "clinic.patients.read",
        "clinic.patients.update",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    requireDateOfBirth: true,
    maxPatientsPerTenant: 100000,
  } };

  console.log("clinic-patient-management ready.");
  console.log("Operations available:", ['createPatient', 'getPatient'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
