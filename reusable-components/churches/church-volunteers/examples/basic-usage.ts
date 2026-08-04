/**
 * Minimal usage example for the church-volunteers component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchVolunteersStore,
  createVolunteer,
  assignVolunteer,
} from "../backend";

async function main() {
  const store = new InMemoryChurchVolunteersStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.volunteers.manage",
        "church.volunteers.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxAssignmentsPerVolunteer: 5,
  } };

  console.log("church-volunteers ready.");
  console.log("Operations available:", ['createVolunteer', 'assignVolunteer'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
