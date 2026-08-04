/**
 * Minimal usage example for the roles-and-permissions-ui component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRolesAndPermissionsUiStore,
  defineRole,
  listRoles,
  listPermissionsForRole,
} from "../backend";

async function main() {
  const store = new InMemoryRolesAndPermissionsUiStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "roles.read",
        "roles.manage",
        "permissions.read",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultRoleOnInvite: "member",
    allowOwnerRoleEditing: false,
  } };

  console.log("roles-and-permissions-ui ready.");
  console.log("Operations available:", ['defineRole', 'listRoles', 'listPermissionsForRole'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
