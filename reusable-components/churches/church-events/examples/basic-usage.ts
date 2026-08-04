/**
 * Minimal usage example for the church-events component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchEventsStore,
  createEvent,
  registerForMember,
} from "../backend";

async function main() {
  const store = new InMemoryChurchEventsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.events.manage",
        "church.events.read",
        "church.events.register",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultCapacity: 200,
    allowOverRegistration: false,
  } };

  console.log("church-events ready.");
  console.log("Operations available:", ['createEvent', 'registerForMember'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
