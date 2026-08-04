/**
 * Business logic for the school-exams component.
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
  Exam,
} from "./types";

import {
  type CreateExamInput,
  validateCreateExamInput,
  type MarkExamGradedInput,
  validateMarkExamGradedInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolExamsStore {
  getExam(tenantId: string, id: EntityId): Exam | undefined;
  putExam(tenantId: string, entity: Exam): void;
  listExams(tenantId: string): readonly Exam[];
  deleteExam(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolExamsStore implements SchoolExamsStore {
  private readonly exams = new Map<string, Map<string, Exam>>();

  getExam(tenantId: string, id: EntityId): Exam | undefined {
    return this.exams.get(tenantId)?.get(id);
  }
  putExam(tenantId: string, entity: Exam): void {
    let byId = this.exams.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.exams.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listExams(tenantId: string): readonly Exam[] {
    const byId = this.exams.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteExam(tenantId: string, id: EntityId): boolean {
    return this.exams.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolExamsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultExamWindowDays: number;
}

//////////////////////////////////////////////////////////////////////
// createExam — Create a new exam period.
//////////////////////////////////////////////////////////////////////
export function createExam(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateExamInput
): Result<Exam> {
  deps.permissions.require(ctx, asPermission("school.exams.manage"));
  const validated = validateCreateExamInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.startsAt >= v.endsAt) {
      return err(ErrorCode.INVALID_INPUT, "startsAt must be before endsAt");
    }
    const id = asEntityId("exm_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const exam: Exam = {
      id, tenantId: ctx.tenantId, name: v.name, period: v.period,
      startsAt: v.startsAt, endsAt: v.endsAt, status: "scheduled",
      createdAt: now, updatedAt: now,
    };
    deps.store.putExam(ctx.tenantId, exam);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-exams",
      action: "school.exam.created", entityType: "exam", entityId: id,
      details: { name: v.name, period: v.period },
    }));
    return ok(exam);
}

//////////////////////////////////////////////////////////////////////
// markExamGraded — Mark an exam as fully graded.
//////////////////////////////////////////////////////////////////////
export function markExamGraded(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkExamGradedInput
): Result<Exam> {
  deps.permissions.require(ctx, asPermission("school.exams.manage"));
  const validated = validateMarkExamGradedInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.examId);
    const existing = deps.store.getExam(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "exam not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "scheduled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only scheduled exams can be marked graded");
    }
    const updated: Exam = {
      ...existing, status: "graded", updatedAt: new Date().toISOString(),
    };
    deps.store.putExam(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-exams",
      action: "school.exam.graded", entityType: "exam", entityId: id, details: {},
    }));
    return ok(updated);
}
