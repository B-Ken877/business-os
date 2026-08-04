/**
 * Minimal usage example for the clinic-staff-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicStaffManagementStore,
  createStaff,
  listDoctors,
} from "../backend";

async function main() {
  const store = new InMemoryClinicStaffManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.staff.manage",
        "clinic.staff.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxStaffPerTenant: 500,
  } };

  console.log("clinic-staff-management ready.");
  console.log("Operations available:", ['createStaff', 'listDoctors'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
