/**
 * Minimal usage example for the messaging-center component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryMessagingCenterStore,
  sendMessage,
  markDelivered,
  listMessages,
} from "../backend";

async function main() {
  const store = new InMemoryMessagingCenterStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "messaging.messages.send",
        "messaging.broadcasts.send",
        "messaging.messages.read",
        "messaging.templates.manage",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultChannel: "in_app",
    maxBroadcastRecipients: 500,
    rateLimitPerMinute: 60,
    retryFailedDeliveries: true,
  } };

  console.log("messaging-center ready.");
  console.log("Operations available:", ['sendMessage', 'markDelivered', 'listMessages'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
