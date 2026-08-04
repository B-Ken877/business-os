/**
 * Minimal usage example for the service-feedback component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceFeedbackStore,
  submitFeedback,
  listNeedsFollowUp,
} from "../backend";

async function main() {
  const store = new InMemoryServiceFeedbackStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.feedback.create",
        "service.feedback.read",
        "service.feedback.respond",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    minRatingForGood: 4,
  } };

  console.log("service-feedback ready.");
  console.log("Operations available:", ['submitFeedback', 'listNeedsFollowUp'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
