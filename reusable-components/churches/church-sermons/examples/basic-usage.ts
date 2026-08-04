/**
 * Minimal usage example for the church-sermons component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchSermonsStore,
  recordSermon,
  listSermonsBySpeaker,
} from "../backend";

async function main() {
  const store = new InMemoryChurchSermonsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.sermons.manage",
        "church.sermons.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxSermonsPerTenant: 10000,
  } };

  console.log("church-sermons ready.");
  console.log("Operations available:", ['recordSermon', 'listSermonsBySpeaker'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
