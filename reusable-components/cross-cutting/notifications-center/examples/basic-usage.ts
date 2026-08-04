/**
 * Minimal usage example for the notifications-center component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryNotificationsCenterStore,
  pushNotification,
  listUnreadForCurrentUser,
  markRead,
} from "../backend";

async function main() {
  const store = new InMemoryNotificationsCenterStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "notifications.push",
        "notifications.read",
        "notifications.dismiss",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultExpiryHours: 168,
    maxPerUser: 1000,
  } };

  console.log("notifications-center ready.");
  console.log("Operations available:", ['pushNotification', 'listUnreadForCurrentUser', 'markRead'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
