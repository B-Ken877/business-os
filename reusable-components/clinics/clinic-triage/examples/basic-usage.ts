/**
 * Minimal usage example for the clinic-triage component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicTriageStore,
  recordTriage,
  listEmergencyTriage,
} from "../backend";

async function main() {
  const store = new InMemoryClinicTriageStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.triage.intake",
        "clinic.triage.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    emergencyAutoNotify: true,
  } };

  console.log("clinic-triage ready.");
  console.log("Operations available:", ['recordTriage', 'listEmergencyTriage'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
