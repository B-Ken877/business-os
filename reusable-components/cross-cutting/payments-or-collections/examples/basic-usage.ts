/**
 * Minimal usage example for the payments-or-collections component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryPaymentsOrCollectionsStore,
  recordPayment,
  refundPayment,
  listPaymentsForInvoice,
} from "../backend";

async function main() {
  const store = new InMemoryPaymentsOrCollectionsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "payments.record",
        "payments.read",
        "payments.refund",
        "payments.reconcile",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultCurrency: "HTG",
    supportedMethods: ["cash","card","mobile_money","bank_transfer"],
    requireReferenceForNonCash: true,
  } };

  console.log("payments-or-collections ready.");
  console.log("Operations available:", ['recordPayment', 'refundPayment', 'listPaymentsForInvoice'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
