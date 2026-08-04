import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryServiceJobTrackingStore,
  createJob,
  addTask,
  completeTask,
  defaultConfig,
  type Job,
  type JobTask,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceJobTrackingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.jobs.manage",
    "service.jobs.read",
    "service.jobs.update_task",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-job-tracking / createJob", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createJob(ctx, denyDeps, { customerId: "ent_test", title: "value", bookingId: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-job-tracking / addTask", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      addTask(ctx, denyDeps, { jobId: "ent_test", title: "value", order: 1 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-job-tracking / completeTask", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      completeTask(ctx, denyDeps, { taskId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-job-tracking / job + task lifecycle", () => {
  it("creates a job, adds tasks, and auto-completes when all done", () => {
    const { ctx, deps } = setup();
    const job = createJob(ctx, deps, { customerId: "ent_c1", title: "Repair phone" });
    expect(isOk(job)).toBe(true);
    if (!job.ok) return;
    const t1 = addTask(ctx, deps, { jobId: job.value.id, title: "Diagnose", order: 1 });
    const t2 = addTask(ctx, deps, { jobId: job.value.id, title: "Fix", order: 2 });
    if (!t1.ok || !t2.ok) throw new Error("setup failed");
    completeTask(ctx, deps, { taskId: t1.value.id });
    // Job should still be open (one task left).
    const jobBefore = deps.store.getJob(ctx.tenantId, job.value.id);
    expect(jobBefore?.status).toBe("open");
    // Complete the last task — job should auto-complete.
    completeTask(ctx, deps, { taskId: t2.value.id });
    const jobAfter = deps.store.getJob(ctx.tenantId, job.value.id);
    expect(jobAfter?.status).toBe("completed");
  });
  it("rejects completing a non-pending task", () => {
    const { ctx, deps } = setup();
    const job = createJob(ctx, deps, { customerId: "ent_c1", title: "X" });
    if (!job.ok) throw new Error("setup failed");
    const t = addTask(ctx, deps, { jobId: job.value.id, title: "T", order: 1 });
    if (!t.ok) throw new Error("setup failed");
    completeTask(ctx, deps, { taskId: t.value.id });
    const r = completeTask(ctx, deps, { taskId: t.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("rejects adding tasks to a completed job", () => {
    const { ctx, deps } = setup();
    const job = createJob(ctx, deps, { customerId: "ent_c1", title: "X" });
    if (!job.ok) throw new Error("setup failed");
    const t = addTask(ctx, deps, { jobId: job.value.id, title: "T", order: 1 });
    if (!t.ok) throw new Error("setup failed");
    completeTask(ctx, deps, { taskId: t.value.id });
    // Job is now completed.
    const r = addTask(ctx, deps, { jobId: job.value.id, title: "T2", order: 2 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
