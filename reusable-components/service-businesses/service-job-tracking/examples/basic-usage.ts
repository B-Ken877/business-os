/**
 * Minimal usage example for the service-job-tracking component.
 *
 * Run with: npx tsx examples/basic-usage.ts
 */

import {
  createTenantContext,
  InMemoryPermissionChecker,
  InMemoryAuditSink,
} from "@business-os/shared";
import {
  InMemoryServiceJobTrackingStore,
  createJob,
  addTask,
  completeTask,
} from "../backend";

async function main() {
  const store = new InMemoryServiceJobTrackingStore();
  const audit = new InMemoryAuditSink();
  const permissions = new InMemoryPermissionChecker([
    {
      tenantId: "demo-tenant",
      userId: "demo-user",
      permissions: [
        "service.jobs.manage",
        "service.jobs.read",
        "service.jobs.update_task",
      ],
    },
  ]);
  const ctx = createTenantContext({
    tenantId: "demo-tenant",
    userId: "demo-user",
  });
  const deps = { store, audit, permissions, config: {
    maxTasksPerJob: 50,
  } };

  console.log("service-job-tracking ready.");
  console.log("Operations available:", ['createJob', 'addTask', 'completeTask'].join(", "));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
