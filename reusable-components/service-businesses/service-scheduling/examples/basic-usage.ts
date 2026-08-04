/**
 * Minimal usage example for the service-scheduling component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceSchedulingStore,
  setWorkingHours,
  isAvailable,
} from "../backend";

async function main() {
  const store = new InMemoryServiceSchedulingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.scheduling.manage",
        "service.scheduling.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultWorkingStartHour: 9,
    defaultWorkingEndHour: 17,
  } };

  console.log("service-scheduling ready.");
  console.log("Operations available:", ['setWorkingHours', 'isAvailable'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
