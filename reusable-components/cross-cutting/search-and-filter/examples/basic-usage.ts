/**
 * Minimal usage example for the search-and-filter component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySearchAndFilterStore,
  runQuery,
  saveQuery,
} from "../backend";

async function main() {
  const store = new InMemorySearchAndFilterStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "search.query",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultPageSize: 20,
    maxPageSize: 100,
    maxFilterClauses: 10,
  } };

  console.log("search-and-filter ready.");
  console.log("Operations available:", ['runQuery', 'saveQuery'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
