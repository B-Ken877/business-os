/**
 * Minimal usage example for the clinic-consent component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryClinicConsentStore,
  grantConsent,
  revokeConsent,
  hasActiveConsent,
} from "../backend";

async function main() {
  const store = new InMemoryClinicConsentStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "clinic.consent.manage",
        "clinic.consent.read",
        "clinic.consent.check",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    requireExplicitRevokeReason: true,
  } };

  console.log("clinic-consent ready.");
  console.log("Operations available:", ['grantConsent', 'revokeConsent', 'hasActiveConsent'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
