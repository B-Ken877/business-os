/**
 * Minimal usage example for the activity-timeline component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryActivityTimelineStore,
  recordEvent,
  listEventsForEntity,
} from "../backend";

async function main() {
  const store = new InMemoryActivityTimelineStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "timeline.events.record",
        "timeline.events.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxEventsPerEntity: 10000,
    summaryMaxLength: 500,
  } };

  console.log("activity-timeline ready.");
  console.log("Operations available:", ['recordEvent', 'listEventsForEntity'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
