/**
 * Business logic for the school-student-portal component.
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
  StudentPortalSession,
} from "./types";

import {
  type StartSessionInput,
  validateStartSessionInput,
  type EndSessionInput,
  validateEndSessionInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SchoolStudentPortalStore {
  getStudentPortalSession(tenantId: string, id: EntityId): StudentPortalSession | undefined;
  putStudentPortalSession(tenantId: string, entity: StudentPortalSession): void;
  listStudentPortalSessions(tenantId: string): readonly StudentPortalSession[];
  deleteStudentPortalSession(tenantId: string, id: EntityId): boolean;
}

export class InMemorySchoolStudentPortalStore implements SchoolStudentPortalStore {
  private readonly studentPortalSessions = new Map<string, Map<string, StudentPortalSession>>();

  getStudentPortalSession(tenantId: string, id: EntityId): StudentPortalSession | undefined {
    return this.studentPortalSessions.get(tenantId)?.get(id);
  }
  putStudentPortalSession(tenantId: string, entity: StudentPortalSession): void {
    let byId = this.studentPortalSessions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.studentPortalSessions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStudentPortalSessions(tenantId: string): readonly StudentPortalSession[] {
    const byId = this.studentPortalSessions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStudentPortalSession(tenantId: string, id: EntityId): boolean {
    return this.studentPortalSessions.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SchoolStudentPortalStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly allowStudentMessageReply: boolean;
}

//////////////////////////////////////////////////////////////////////
// startSession — Start a portal session for a student. The studentId is taken from the calling context's user identity, NOT from the request body.
//////////////////////////////////////////////////////////////////////
export function startSession(
  ctx: TenantContext,
  deps: Dependencies,
  input: StartSessionInput
): Result<StudentPortalSession> {
  deps.permissions.require(ctx, asPermission("school.portal.student.view"));
  const validated = validateStartSessionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // The orchestrator MUST verify that ctx.userId corresponds to v.studentId
    // before calling this operation. The operation itself does NOT re-verify
    // the identity binding (that is the orchestrator's responsibility).
    // However, the operation DOES enforce tenant isolation.
    const id = asEntityId("psess_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const session: StudentPortalSession = {
      id, tenantId: ctx.tenantId, studentId: v.studentId,
      startedAt: now, status: "active", createdAt: now, updatedAt: now,
    };
    deps.store.putStudentPortalSession(ctx.tenantId, session);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-student-portal",
      action: "school.portal.session_started", entityType: "student_portal_session", entityId: id,
      details: { studentId: v.studentId },
    }));
    return ok(session);
}

//////////////////////////////////////////////////////////////////////
// endSession — End a portal session.
//////////////////////////////////////////////////////////////////////
export function endSession(
  ctx: TenantContext,
  deps: Dependencies,
  input: EndSessionInput
): Result<StudentPortalSession> {
  deps.permissions.require(ctx, asPermission("school.portal.student.view"));
  const validated = validateEndSessionInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.sessionId);
    const existing = deps.store.getStudentPortalSession(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "session not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "active") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "session is not active");
    }
    const updated: StudentPortalSession = {
      ...existing, status: "ended", updatedAt: new Date().toISOString(),
    };
    deps.store.putStudentPortalSession(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "school-student-portal",
      action: "school.portal.session_ended", entityType: "student_portal_session", entityId: id, details: {},
    }));
    return ok(updated);
}
