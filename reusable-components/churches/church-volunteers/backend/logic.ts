/**
 * Business logic for the church-volunteers component.
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
  Volunteer,
  VolunteerAssignment,
} from "./types";

import {
  type CreateVolunteerInput,
  validateCreateVolunteerInput,
  type AssignVolunteerInput,
  validateAssignVolunteerInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ChurchVolunteersStore {
  getVolunteer(tenantId: string, id: EntityId): Volunteer | undefined;
  putVolunteer(tenantId: string, entity: Volunteer): void;
  listVolunteers(tenantId: string): readonly Volunteer[];
  deleteVolunteer(tenantId: string, id: EntityId): boolean;
  getVolunteerAssignment(tenantId: string, id: EntityId): VolunteerAssignment | undefined;
  putVolunteerAssignment(tenantId: string, entity: VolunteerAssignment): void;
  listVolunteerAssignments(tenantId: string): readonly VolunteerAssignment[];
  deleteVolunteerAssignment(tenantId: string, id: EntityId): boolean;
}

export class InMemoryChurchVolunteersStore implements ChurchVolunteersStore {
  private readonly volunteers = new Map<string, Map<string, Volunteer>>();
  private readonly volunteerAssignments = new Map<string, Map<string, VolunteerAssignment>>();

  getVolunteer(tenantId: string, id: EntityId): Volunteer | undefined {
    return this.volunteers.get(tenantId)?.get(id);
  }
  putVolunteer(tenantId: string, entity: Volunteer): void {
    let byId = this.volunteers.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.volunteers.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listVolunteers(tenantId: string): readonly Volunteer[] {
    const byId = this.volunteers.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteVolunteer(tenantId: string, id: EntityId): boolean {
    return this.volunteers.get(tenantId)?.delete(id) ?? false;
  }

  getVolunteerAssignment(tenantId: string, id: EntityId): VolunteerAssignment | undefined {
    return this.volunteerAssignments.get(tenantId)?.get(id);
  }
  putVolunteerAssignment(tenantId: string, entity: VolunteerAssignment): void {
    let byId = this.volunteerAssignments.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.volunteerAssignments.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listVolunteerAssignments(tenantId: string): readonly VolunteerAssignment[] {
    const byId = this.volunteerAssignments.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteVolunteerAssignment(tenantId: string, id: EntityId): boolean {
    return this.volunteerAssignments.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ChurchVolunteersStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly maxAssignmentsPerVolunteer: number;
}

//////////////////////////////////////////////////////////////////////
// createVolunteer — Create a volunteer record for a member.
//////////////////////////////////////////////////////////////////////
export function createVolunteer(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateVolunteerInput
): Result<Volunteer> {
  deps.permissions.require(ctx, asPermission("church.volunteers.manage"));
  const validated = validateCreateVolunteerInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // One volunteer record per member.
    const existing = deps.store.listVolunteers(ctx.tenantId)
      .filter((vol) => vol.memberId === v.memberId);
    if (existing.length > 0) {
      return err(ErrorCode.CONFLICT, "member is already a volunteer");
    }
    const id = asEntityId("vol_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const volunteer: Volunteer = {
      id, tenantId: ctx.tenantId, memberId: v.memberId, role: v.role,
      status: "active", createdAt: now, updatedAt: now,
    };
    deps.store.putVolunteer(ctx.tenantId, volunteer);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-volunteers",
      action: "church.volunteer.created", entityType: "volunteer", entityId: id,
      details: { memberId: v.memberId, role: v.role },
    }));
    return ok(volunteer);
}

//////////////////////////////////////////////////////////////////////
// assignVolunteer — Assign a volunteer to an event or ministry. Enforces the max-assignments cap.
//////////////////////////////////////////////////////////////////////
export function assignVolunteer(
  ctx: TenantContext,
  deps: Dependencies,
  input: AssignVolunteerInput
): Result<VolunteerAssignment> {
  deps.permissions.require(ctx, asPermission("church.volunteers.manage"));
  const validated = validateAssignVolunteerInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const volunteer = deps.store.getVolunteer(ctx.tenantId, asEntityId(v.volunteerId));
    if (!volunteer) return err(ErrorCode.NOT_FOUND, "volunteer not found");
    assertSameTenant(ctx, volunteer.tenantId);
    if (volunteer.status !== "active") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "volunteer is not active");
    }
    // Cap check.
    const activeAssignments = deps.store.listVolunteerAssignments(ctx.tenantId)
      .filter((a) => a.volunteerId === v.volunteerId && a.status === "active").length;
    if (activeAssignments >= deps.config.maxAssignmentsPerVolunteer) {
      return err(ErrorCode.LIMIT_EXCEEDED, "volunteer at max active assignments");
    }
    // Duplicate check.
    const existing = deps.store.listVolunteerAssignments(ctx.tenantId)
      .find((a) => a.volunteerId === v.volunteerId && a.assignmentType === v.assignmentType && a.assignmentId === v.assignmentId && a.status === "active");
    if (existing) {
      return err(ErrorCode.CONFLICT, "volunteer already assigned to this");
    }
    const id = asEntityId("va_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const assignment: VolunteerAssignment = {
      id, tenantId: ctx.tenantId, volunteerId: v.volunteerId,
      assignmentType: v.assignmentType, assignmentId: v.assignmentId,
      status: "active", createdAt: now, updatedAt: now,
    };
    deps.store.putVolunteerAssignment(ctx.tenantId, assignment);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "church-volunteers",
      action: "church.volunteer.assigned", entityType: "volunteer_assignment", entityId: id,
      details: { volunteerId: v.volunteerId, assignmentType: v.assignmentType, assignmentId: v.assignmentId },
    }));
    return ok(assignment);
}
