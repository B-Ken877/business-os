/**
 * Minimal usage example for the clinic-billing component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicBillingStore,
  generateInvoice,
  markInvoicePaid,
} from "../backend";

async function main() {
  const store = new InMemoryClinicBillingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.billing.generate",
        "clinic.billing.read",
        "clinic.billing.record_payment",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultConsultationFeeCents: 5000,
    defaultCurrency: "HTG",
  } };

  console.log("clinic-billing ready.");
  console.log("Operations available:", ['generateInvoice', 'markInvoicePaid'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
