/**
 * Minimal usage example for the document-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryDocumentManagementStore,
  uploadDocument,
  listDocumentsForEntity,
  softDeleteDocument,
} from "../backend";

async function main() {
  const store = new InMemoryDocumentManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "documents.upload",
        "documents.read",
        "documents.delete",
        "documents.manageQuota",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxFileSizeBytes: 10485760,
    allowedMimeTypes: ["application/pdf","image/png","image/jpeg"],
    retentionDaysAfterDelete: 30,
    tenantStorageQuotaBytes: 1073741824,
  } };

  console.log("document-management ready.");
  console.log("Operations available:", ['uploadDocument', 'listDocumentsForEntity', 'softDeleteDocument'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
