/**
 * Business logic for the school-class-scheduling component.
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
  ClassSession,
} from "./types";

import {
  type ScheduleSessionInput,
  validateScheduleSessionInput,
  type ListSessionsForTeacherInput,
  validateListSessionsForTeacherInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolClassSchedulingStore {
  getClassSession(tenantId: string, id: EntityId): ClassSession | undefined;
  putClassSession(tenantId: string, entity: ClassSession): void;
  listClassSessions(tenantId: string): readonly ClassSession[];
  deleteClassSession(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolClassSchedulingStore implements SchoolClassSchedulingStore {
  private readonly classSessions = new Map<string, Map<string, ClassSession>>();

  getClassSession(tenantId: string, id: EntityId): ClassSession | undefined {
    return this.classSessions.get(tenantId)?.get(id);
  }
  putClassSession(tenantId: string, entity: ClassSession): void {
    let byId = this.classSessions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.classSessions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listClassSessions(tenantId: string): readonly ClassSession[] {
    const byId = this.classSessions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteClassSession(tenantId: string, id: EntityId): boolean {
    return this.classSessions.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolClassSchedulingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly sessionDurationMinutes: number;
}

//////////////////////////////////////////////////////////////////////
// scheduleSession — Schedule a class session. Detects teacher and room conflicts.
//////////////////////////////////////////////////////////////////////
export function scheduleSession(
  ctx: TenantContext,
  deps: Dependencies,
  input: ScheduleSessionInput
): Result<ClassSession> {
  deps.permissions.require(ctx, asPermission("school.scheduling.manage"));
  const validated = validateScheduleSessionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.dayOfWeek < 1 || v.dayOfWeek > 7) {
      return err(ErrorCode.INVALID_INPUT, "dayOfWeek must be 1-7");
    }
    if (v.startHour < 0 || v.startHour > 23) {
      return err(ErrorCode.INVALID_INPUT, "startHour must be 0-23");
    }
    if (v.startMinute !== 0 && v.startMinute !== 30) {
      return err(ErrorCode.INVALID_INPUT, "startMinute must be 0 or 30");
    }
    // Conflict detection.
    const sessions = deps.store.listClassSessions(ctx.tenantId);
    const sameSlot = sessions.filter(
      (s) => s.dayOfWeek === v.dayOfWeek && s.startHour === v.startHour && s.startMinute === v.startMinute
    );
    if (sameSlot.some((s) => s.teacherUserId === v.teacherUserId)) {
      return err(ErrorCode.CONFLICT, "teacher already scheduled at this time");
    }
    if (sameSlot.some((s) => s.roomId === v.roomId)) {
      return err(ErrorCode.CONFLICT, "room already booked at this time");
    }
    const id = asEntityId("sess_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const session: ClassSession = {
      id, tenantId: ctx.tenantId, subject: v.subject, teacherUserId: v.teacherUserId,
      roomId: v.roomId, dayOfWeek: v.dayOfWeek, startHour: v.startHour, startMinute: v.startMinute,
      createdAt: now, updatedAt: now,
    };
    deps.store.putClassSession(ctx.tenantId, session);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-class-scheduling",
      action: "school.session.scheduled", entityType: "class_session", entityId: id,
      details: { subject: v.subject, teacherUserId: v.teacherUserId, dayOfWeek: v.dayOfWeek, startHour: v.startHour },
    }));
    return ok(session);
}

//////////////////////////////////////////////////////////////////////
// listSessionsForTeacher — List all sessions assigned to a teacher.
//////////////////////////////////////////////////////////////////////
export function listSessionsForTeacher(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListSessionsForTeacherInput
): Result<readonly ClassSession[]> {
  deps.permissions.require(ctx, asPermission("school.scheduling.read"));
  const validated = validateListSessionsForTeacherInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listClassSessions(ctx.tenantId);
    const filtered = all.filter((s) => s.teacherUserId === v.teacherUserId);
    filtered.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startHour - b.startHour);
    return ok(filtered);
}
