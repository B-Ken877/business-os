/**
 * Minimal usage example for the school-certificates component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemorySchoolCertificatesStore,
  issueCertificate,
  revokeCertificate,
} from "../backend";

async function main() {
  const store = new InMemorySchoolCertificatesStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "school.certificates.issue",
        "school.certificates.read",
        "school.certificates.revoke",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    certificateTemplateKey: "default_graduation",
  } };

  console.log("school-certificates ready.");
  console.log("Operations available:", ['issueCertificate', 'revokeCertificate'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
