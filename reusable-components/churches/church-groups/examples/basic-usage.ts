/**
 * Minimal usage example for the church-groups component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchGroupsStore,
  createGroup,
  joinGroup,
} from "../backend";

async function main() {
  const store = new InMemoryChurchGroupsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.groups.manage",
        "church.groups.read",
        "church.groups.join",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxGroupsPerTenant: 100,
    defaultMaxMembers: 30,
  } };

  console.log("church-groups ready.");
  console.log("Operations available:", ['createGroup', 'joinGroup'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
