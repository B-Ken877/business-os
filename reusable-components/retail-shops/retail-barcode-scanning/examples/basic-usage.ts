/**
 * Minimal usage example for the retail-barcode-scanning component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailBarcodeScanningStore,
  registerBarcode,
  lookupBarcode,
} from "../backend";

async function main() {
  const store = new InMemoryRetailBarcodeScanningStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.barcodes.register",
        "retail.barcodes.lookup",
        "retail.barcodes.remove",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    allowUnknownBarcodeCreate: false,
  } };

  console.log("retail-barcode-scanning ready.");
  console.log("Operations available:", ['registerBarcode', 'lookupBarcode'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
