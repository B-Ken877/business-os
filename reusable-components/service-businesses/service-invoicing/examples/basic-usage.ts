/**
 * Minimal usage example for the service-invoicing component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceInvoicingStore,
  generateInvoice,
  markPaid,
} from "../backend";

async function main() {
  const store = new InMemoryServiceInvoicingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.invoicing.generate",
        "service.invoicing.read",
        "service.invoicing.record_payment",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultCurrency: "HTG",
    defaultTaxBps: 1000,
  } };

  console.log("service-invoicing ready.");
  console.log("Operations available:", ['generateInvoice', 'markPaid'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
