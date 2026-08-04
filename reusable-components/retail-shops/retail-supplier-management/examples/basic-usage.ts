/**
 * Minimal usage example for the retail-supplier-management component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryRetailSupplierManagementStore,
  createSupplier,
  createPurchaseOrder,
  markPurchaseOrderReceived,
} from "../backend";

async function main() {
  const store = new InMemoryRetailSupplierManagementStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "retail.suppliers.manage",
        "retail.suppliers.read",
        "retail.purchaseorders.create",
        "retail.purchaseorders.receive",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    defaultPaymentTermsDays: 30,
  } };

  console.log("retail-supplier-management ready.");
  console.log("Operations available:", ['createSupplier', 'createPurchaseOrder', 'markPurchaseOrderReceived'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
