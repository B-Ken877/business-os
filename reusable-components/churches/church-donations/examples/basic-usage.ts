/**
 * Minimal usage example for the church-donations component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryChurchDonationsStore,
  recordDonation,
  computeMemberGivingTotal,
} from "../backend";

async function main() {
  const store = new InMemoryChurchDonationsStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "church.donations.record",
        "church.donations.read",
        "church.donations.read_member_history",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultCurrency: "HTG",
    requireFundDesignation: true,
  } };

  console.log("church-donations ready.");
  console.log("Operations available:", ['recordDonation', 'computeMemberGivingTotal'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
