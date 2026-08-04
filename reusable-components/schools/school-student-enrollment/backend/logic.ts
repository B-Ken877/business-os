/**
 * Business logic for the school-student-enrollment component.
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
  Student,
} from "./types";

import {
  type EnrollStudentInput,
  validateEnrollStudentInput,
  type UpdateEnrollmentStatusInput,
  validateUpdateEnrollmentStatusInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolStudentEnrollmentStore {
  getStudent(tenantId: string, id: EntityId): Student | undefined;
  putStudent(tenantId: string, entity: Student): void;
  listStudents(tenantId: string): readonly Student[];
  deleteStudent(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolStudentEnrollmentStore implements SchoolStudentEnrollmentStore {
  private readonly students = new Map<string, Map<string, Student>>();

  getStudent(tenantId: string, id: EntityId): Student | undefined {
    return this.students.get(tenantId)?.get(id);
  }
  putStudent(tenantId: string, entity: Student): void {
    let byId = this.students.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.students.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStudents(tenantId: string): readonly Student[] {
    const byId = this.students.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStudent(tenantId: string, id: EntityId): boolean {
    return this.students.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolStudentEnrollmentStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxStudentsPerTenant: number;
}

//////////////////////////////////////////////////////////////////////
// enrollStudent — Enroll a new student.
//////////////////////////////////////////////////////////////////////
export function enrollStudent(
  ctx: TenantContext,
  deps: Dependencies,
  input: EnrollStudentInput
): Result<Student> {
  deps.permissions.require(ctx, asPermission("school.students.create"));
  const validated = validateEnrollStudentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("stu_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const student: Student = {
      id, tenantId: ctx.tenantId, firstName: v.firstName, lastName: v.lastName,
      dateOfBirth: v.dateOfBirth, guardianName: v.guardianName,
      guardianPhone: v.guardianPhone ?? null, enrollmentStatus: "enrolled",
      createdAt: now, updatedAt: now,
    };
    deps.store.putStudent(ctx.tenantId, student);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-student-enrollment",
      action: "school.student.enrolled", entityType: "student", entityId: id,
      details: { firstName: v.firstName, lastName: v.lastName },
    }));
    return ok(student);
}

//////////////////////////////////////////////////////////////////////
// updateEnrollmentStatus — Update a student's enrollment status.
//////////////////////////////////////////////////////////////////////
export function updateEnrollmentStatus(
  ctx: TenantContext,
  deps: Dependencies,
  input: UpdateEnrollmentStatusInput
): Result<Student> {
  deps.permissions.require(ctx, asPermission("school.students.update"));
  const validated = validateUpdateEnrollmentStatusInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.studentId);
    const existing = deps.store.getStudent(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "student not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.enrollmentStatus === v.newStatus) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "student already in this status");
    }
    // Enforce valid transitions.
    const validTransitions: Record<string, ReadonlyArray<string>> = {
      applicant: ["enrolled", "withdrawn"],
      enrolled: ["withdrawn", "graduated"],
      withdrawn: [],
      graduated: [],
    };
    const allowed = validTransitions[existing.enrollmentStatus] ?? [];
    if (!allowed.includes(v.newStatus)) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, `cannot transition from ${existing.enrollmentStatus} to ${v.newStatus}`);
    }
    const updated: Student = {
      ...existing, enrollmentStatus: v.newStatus, updatedAt: new Date().toISOString(),
    };
    deps.store.putStudent(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-student-enrollment",
      action: "school.student.status_updated", entityType: "student", entityId: id,
      details: { from: existing.enrollmentStatus, to: v.newStatus },
    }));
    return ok(updated);
}
