/**
 * Minimal usage example for the school-parent-communication component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolParentCommunicationStore,
  sendParentMessage,
  listMessagesForStudent,
} from "../backend";

async function main() {
  const store = new InMemorySchoolParentCommunicationStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.parent_comm.send",
        "school.parent_comm.read",
        "school.parent_comm.broadcast",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    broadcastRateLimitPerHour: 10,
  } };

  console.log("school-parent-communication ready.");
  console.log("Operations available:", ['sendParentMessage', 'listMessagesForStudent'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
