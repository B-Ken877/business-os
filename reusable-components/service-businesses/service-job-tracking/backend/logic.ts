/**
 * Business logic for the service-job-tracking component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  Job,
  JobTask,
} from "./types";

import {
  type CreateJobInput,
  validateCreateJobInput,
  type AddTaskInput,
  validateAddTaskInput,
  type CompleteTaskInput,
  validateCompleteTaskInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceJobTrackingStore {
  getJob(tenantId: string, id: EntityId): Job | undefined;
  putJob(tenantId: string, entity: Job): void;
  listJobs(tenantId: string): readonly Job[];
  deleteJob(tenantId: string, id: EntityId): boolean;
  getJobTask(tenantId: string, id: EntityId): JobTask | undefined;
  putJobTask(tenantId: string, entity: JobTask): void;
  listJobTasks(tenantId: string): readonly JobTask[];
  deleteJobTask(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceJobTrackingStore implements ServiceJobTrackingStore {
  private readonly jobs = new Map<string, Map<string, Job>>();
  private readonly jobTasks = new Map<string, Map<string, JobTask>>();

  getJob(tenantId: string, id: EntityId): Job | undefined {
    return this.jobs.get(tenantId)?.get(id);
  }
  putJob(tenantId: string, entity: Job): void {
    let byId = this.jobs.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.jobs.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listJobs(tenantId: string): readonly Job[] {
    const byId = this.jobs.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteJob(tenantId: string, id: EntityId): boolean {
    return this.jobs.get(tenantId)?.delete(id) ?? false;
  }

  getJobTask(tenantId: string, id: EntityId): JobTask | undefined {
    return this.jobTasks.get(tenantId)?.get(id);
  }
  putJobTask(tenantId: string, entity: JobTask): void {
    let byId = this.jobTasks.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.jobTasks.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listJobTasks(tenantId: string): readonly JobTask[] {
    const byId = this.jobTasks.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteJobTask(tenantId: string, id: EntityId): boolean {
    return this.jobTasks.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ServiceJobTrackingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxTasksPerJob: number;
}

//////////////////////////////////////////////////////////////////////
// createJob — Create a new job.
//////////////////////////////////////////////////////////////////////
export function createJob(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateJobInput
): Result<Job> {
  deps.permissions.require(ctx, asPermission("service.jobs.manage"));
  const validated = validateCreateJobInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("job_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const job: Job = {
      id, tenantId: ctx.tenantId, bookingId: v.bookingId ?? null,
      customerId: v.customerId, title: v.title, status: "open",
      createdAt: now, updatedAt: now,
    };
    deps.store.putJob(ctx.tenantId, job);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-job-tracking",
      action: "service.job.created", entityType: "job", entityId: id,
      details: { customerId: v.customerId, title: v.title },
    }));
    return ok(job);
}

//////////////////////////////////////////////////////////////////////
// addTask — Add a task to a job.
//////////////////////////////////////////////////////////////////////
export function addTask(
  ctx: TenantContext,
  deps: Dependencies,
  input: AddTaskInput
): Result<JobTask> {
  deps.permissions.require(ctx, asPermission("service.jobs.manage"));
  const validated = validateAddTaskInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const job = deps.store.getJob(ctx.tenantId, asEntityId(v.jobId));
    if (!job) return err(ErrorCode.NOT_FOUND, "job not found");
    assertSameTenant(ctx, job.tenantId);
    if (job.status !== "open") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot add tasks to a non-open job");
    }
    const taskCount = deps.store.listJobTasks(ctx.tenantId)
      .filter((t) => t.jobId === v.jobId).length;
    if (taskCount >= deps.config.maxTasksPerJob) {
      return err(ErrorCode.LIMIT_EXCEEDED, "task limit reached");
    }
    const id = asEntityId("task_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const task: JobTask = {
      id, tenantId: ctx.tenantId, jobId: v.jobId, title: v.title,
      order: v.order, status: "pending", createdAt: now, updatedAt: now,
    };
    deps.store.putJobTask(ctx.tenantId, task);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-job-tracking",
      action: "service.job.task_added", entityType: "job_task", entityId: id,
      details: { jobId: v.jobId, title: v.title, order: v.order },
    }));
    return ok(task);
}

//////////////////////////////////////////////////////////////////////
// completeTask — Mark a task as completed. If all tasks are complete, the job is auto-completed.
//////////////////////////////////////////////////////////////////////
export function completeTask(
  ctx: TenantContext,
  deps: Dependencies,
  input: CompleteTaskInput
): Result<JobTask> {
  deps.permissions.require(ctx, asPermission("service.jobs.update_task"));
  const validated = validateCompleteTaskInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.taskId);
    const existing = deps.store.getJobTask(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "task not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "pending") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only pending tasks can be completed");
    }
    const updated: JobTask = {
      ...existing, status: "completed", updatedAt: new Date().toISOString(),
    };
    deps.store.putJobTask(ctx.tenantId, updated);
    // Auto-complete the job if all tasks are done.
    const allTasks = deps.store.listJobTasks(ctx.tenantId)
      .filter((t) => t.jobId === existing.jobId);
    if (allTasks.every((t) => t.status === "completed")) {
      const job = deps.store.getJob(ctx.tenantId, asEntityId(existing.jobId));
      if (job && job.status === "open") {
        const updatedJob: Job = {
          ...job, status: "completed", updatedAt: new Date().toISOString(),
        };
        deps.store.putJob(ctx.tenantId, updatedJob);
      }
    }
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-job-tracking",
      action: "service.job.task_completed", entityType: "job_task", entityId: id, details: {},
    }));
    return ok(updated);
}
