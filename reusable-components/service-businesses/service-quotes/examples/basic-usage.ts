/**
 * Minimal usage example for the service-quotes component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceQuotesStore,
  createQuote,
  approveQuote,
} from "../backend";

async function main() {
  const store = new InMemoryServiceQuotesStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.quotes.create",
        "service.quotes.read",
        "service.quotes.approve",
        "service.quotes.reject",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultExpiryDays: 30,
  } };

  console.log("service-quotes ready.");
  console.log("Operations available:", ['createQuote', 'approveQuote'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
