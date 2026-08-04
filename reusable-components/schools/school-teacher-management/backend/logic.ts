/**
 * Business logic for the school-teacher-management component.
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
  Teacher,
} from "./types";

import {
  type CreateTeacherInput,
  validateCreateTeacherInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolTeacherManagementStore {
  getTeacher(tenantId: string, id: EntityId): Teacher | undefined;
  putTeacher(tenantId: string, entity: Teacher): void;
  listTeachers(tenantId: string): readonly Teacher[];
  deleteTeacher(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolTeacherManagementStore implements SchoolTeacherManagementStore {
  private readonly teachers = new Map<string, Map<string, Teacher>>();

  getTeacher(tenantId: string, id: EntityId): Teacher | undefined {
    return this.teachers.get(tenantId)?.get(id);
  }
  putTeacher(tenantId: string, entity: Teacher): void {
    let byId = this.teachers.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.teachers.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTeachers(tenantId: string): readonly Teacher[] {
    const byId = this.teachers.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTeacher(tenantId: string, id: EntityId): boolean {
    return this.teachers.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolTeacherManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxWorkloadHoursPerWeek: number;
}

//////////////////////////////////////////////////////////////////////
// createTeacher — Create a new teacher record.
//////////////////////////////////////////////////////////////////////
export function createTeacher(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateTeacherInput
): Result<Teacher> {
  deps.permissions.require(ctx, asPermission("school.teachers.manage"));
  const validated = validateCreateTeacherInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.subjectsJson) {
      try { JSON.parse(v.subjectsJson); } catch {
        return err(ErrorCode.INVALID_INPUT, "subjectsJson is not valid JSON");
      }
    }
    const id = asEntityId("tch_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const teacher: Teacher = {
      id, tenantId: ctx.tenantId, firstName: v.firstName, lastName: v.lastName,
      email: v.email ?? null, phone: v.phone ?? null,
      subjectsJson: v.subjectsJson ?? "[]", createdAt: now, updatedAt: now,
    };
    deps.store.putTeacher(ctx.tenantId, teacher);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-teacher-management",
      action: "school.teacher.created", entityType: "teacher", entityId: id,
      details: { firstName: v.firstName, lastName: v.lastName },
    }));
    return ok(teacher);
}

//////////////////////////////////////////////////////////////////////
// listTeachers — List all teachers.
//////////////////////////////////////////////////////////////////////
export function listTeachers(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly Teacher[]> {
  deps.permissions.require(ctx, asPermission("school.teachers.read"));
    return ok(deps.store.listTeachers(ctx.tenantId));
}
