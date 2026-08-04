/**
 * Minimal usage example for the church-member-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchMemberManagementStore,
  createMember,
  listVisibleMembers,
  updateOwnVisibility,
} from "../backend";

async function main() {
  const store = new InMemoryChurchMemberManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.members.manage",
        "church.members.read",
        "church.members.update_own",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultDirectoryVisibility: "visible",
    maxMembersPerTenant: 50000,
  } };

  console.log("church-member-management ready.");
  console.log("Operations available:", ['createMember', 'listVisibleMembers', 'updateOwnVisibility'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
