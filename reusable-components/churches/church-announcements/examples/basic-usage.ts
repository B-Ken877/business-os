/**
 * Minimal usage example for the church-announcements component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchAnnouncementsStore,
  publishAnnouncement,
  listActiveAnnouncements,
} from "../backend";

async function main() {
  const store = new InMemoryChurchAnnouncementsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.announcements.publish",
        "church.announcements.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultExpiryDays: 7,
  } };

  console.log("church-announcements ready.");
  console.log("Operations available:", ['publishAnnouncement', 'listActiveAnnouncements'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
