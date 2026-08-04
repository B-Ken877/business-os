/**
 * Minimal usage example for the forms-and-intake component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryFormsAndIntakeStore,
  defineForm,
  publishForm,
  submitForm,
} from "../backend";

async function main() {
  const store = new InMemoryFormsAndIntakeStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "forms.define",
        "forms.publish",
        "forms.submit",
        "forms.readSubmissions",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxFieldsPerForm: 50,
    maxSubmissionsPerForm: 10000,
  } };

  console.log("forms-and-intake ready.");
  console.log("Operations available:", ['defineForm', 'publishForm', 'submitForm'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
