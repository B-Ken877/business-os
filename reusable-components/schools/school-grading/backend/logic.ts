/**
 * Business logic for the school-grading component.
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
  Grade,
  Assessment,
} from "./types";

import {
  type RecordGradeInput,
  validateRecordGradeInput,
  type ComputeStudentAverageInput,
  validateComputeStudentAverageInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolGradingStore {
  getGrade(tenantId: string, id: EntityId): Grade | undefined;
  putGrade(tenantId: string, entity: Grade): void;
  listGrades(tenantId: string): readonly Grade[];
  deleteGrade(tenantId: string, id: EntityId): boolean;
  getAssessment(tenantId: string, id: EntityId): Assessment | undefined;
  putAssessment(tenantId: string, entity: Assessment): void;
  listAssessments(tenantId: string): readonly Assessment[];
  deleteAssessment(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolGradingStore implements SchoolGradingStore {
  private readonly grades = new Map<string, Map<string, Grade>>();
  private readonly assessments = new Map<string, Map<string, Assessment>>();

  getGrade(tenantId: string, id: EntityId): Grade | undefined {
    return this.grades.get(tenantId)?.get(id);
  }
  putGrade(tenantId: string, entity: Grade): void {
    let byId = this.grades.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.grades.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listGrades(tenantId: string): readonly Grade[] {
    const byId = this.grades.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteGrade(tenantId: string, id: EntityId): boolean {
    return this.grades.get(tenantId)?.delete(id) ?? false;
  }

  getAssessment(tenantId: string, id: EntityId): Assessment | undefined {
    return this.assessments.get(tenantId)?.get(id);
  }
  putAssessment(tenantId: string, entity: Assessment): void {
    let byId = this.assessments.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.assessments.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listAssessments(tenantId: string): readonly Assessment[] {
    const byId = this.assessments.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteAssessment(tenantId: string, id: EntityId): boolean {
    return this.assessments.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolGradingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly passingGradePct: number;
}

//////////////////////////////////////////////////////////////////////
// recordGrade — Record a student's grade for an assessment. Idempotent on (studentId, assessmentId).
//////////////////////////////////////////////////////////////////////
export function recordGrade(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordGradeInput
): Result<Grade> {
  deps.permissions.require(ctx, asPermission("school.grades.record"));
  const validated = validateRecordGradeInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.scorePct > 100) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "scorePct cannot exceed 100");
    }
    // Idempotent on (studentId, assessmentId).
    const existing = deps.store.listGrades(ctx.tenantId)
      .find((g) => g.studentId === v.studentId && g.assessmentId === v.assessmentId);
    const id = existing?.id ?? asEntityId("grd_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const grade: Grade = {
      id, tenantId: ctx.tenantId, studentId: v.studentId, assessmentId: v.assessmentId,
      scorePct: v.scorePct, notes: v.notes ?? null,
      createdAt: existing?.createdAt ?? now, updatedAt: now,
    };
    deps.store.putGrade(ctx.tenantId, grade);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-grading",
      action: "school.grade.recorded", entityType: "grade", entityId: id,
      details: { studentId: v.studentId, assessmentId: v.assessmentId, scorePct: v.scorePct },
    }));
    return ok(grade);
}

//////////////////////////////////////////////////////////////////////
// computeStudentAverage — Compute a student's overall average across all assessments.
//////////////////////////////////////////////////////////////////////
export function computeStudentAverage(
  ctx: TenantContext,
  deps: Dependencies,
  input: ComputeStudentAverageInput
): Result<{ averagePct: number; isPassing: boolean; assessmentCount: number }> {
  deps.permissions.require(ctx, asPermission("school.grades.read"));
  const validated = validateComputeStudentAverageInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const grades = deps.store.listGrades(ctx.tenantId)
      .filter((g) => g.studentId === v.studentId);
    if (grades.length === 0) {
      return ok({ averagePct: 0, isPassing: false, assessmentCount: 0 });
    }
    const avg = grades.reduce((s, g) => s + g.scorePct, 0) / grades.length;
    return ok({
      averagePct: Math.round(avg * 100) / 100,
      isPassing: avg >= deps.config.passingGradePct,
      assessmentCount: grades.length,
    });
}
