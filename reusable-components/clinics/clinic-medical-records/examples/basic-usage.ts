/**
 * Minimal usage example for the clinic-medical-records component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicMedicalRecordsStore,
  createRecord,
  listRecordsForPatient,
} from "../backend";

async function main() {
  const store = new InMemoryClinicMedicalRecordsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.records.create",
        "clinic.records.read",
        "clinic.records.update",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxNotesLengthChars: 20000,
  } };

  console.log("clinic-medical-records ready.");
  console.log("Operations available:", ['createRecord', 'listRecordsForPatient'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
