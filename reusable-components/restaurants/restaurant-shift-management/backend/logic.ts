/**
 * Business logic for the restaurant-shift-management component.
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
  Shift,
} from "./types";

import {
  type CreateShiftInput,
  validateCreateShiftInput,
  type AddHandoffNotesInput,
  validateAddHandoffNotesInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RestaurantShiftManagementStore {
  getShift(tenantId: string, id: EntityId): Shift | undefined;
  putShift(tenantId: string, entity: Shift): void;
  listShifts(tenantId: string): readonly Shift[];
  deleteShift(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantShiftManagementStore implements RestaurantShiftManagementStore {
  private readonly shifts = new Map<string, Map<string, Shift>>();

  getShift(tenantId: string, id: EntityId): Shift | undefined {
    return this.shifts.get(tenantId)?.get(id);
  }
  putShift(tenantId: string, entity: Shift): void {
    let byId = this.shifts.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.shifts.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listShifts(tenantId: string): readonly Shift[] {
    const byId = this.shifts.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteShift(tenantId: string, id: EntityId): boolean {
    return this.shifts.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantShiftManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly minShiftNoticeMinutes: number;
}

//////////////////////////////////////////////////////////////////////
// createShift — Schedule a new shift.
//////////////////////////////////////////////////////////////////////
export function createShift(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateShiftInput
): Result<Shift> {
  deps.permissions.require(ctx, asPermission("restaurant.shifts.manage"));
  const validated = validateCreateShiftInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.startsAt >= v.endsAt) {
      return err(ErrorCode.INVALID_INPUT, "startsAt must be before endsAt");
    }
    const id = asEntityId("shf_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const shift: Shift = {
      id, tenantId: ctx.tenantId, staffUserId: v.staffUserId,
      startsAt: v.startsAt, endsAt: v.endsAt, role: v.role,
      status: "scheduled", handoffNotes: null, createdAt: now, updatedAt: now,
    };
    deps.store.putShift(ctx.tenantId, shift);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-shift-management",
      action: "restaurant.shift.created", entityType: "shift", entityId: id,
      details: { staffUserId: v.staffUserId, role: v.role, startsAt: v.startsAt },
    }));
    return ok(shift);
}

//////////////////////////////////////////////////////////////////////
// addHandoffNotes — Append handoff notes to a shift, for the next shift to read.
//////////////////////////////////////////////////////////////////////
export function addHandoffNotes(
  ctx: TenantContext,
  deps: Dependencies,
  input: AddHandoffNotesInput
): Result<Shift> {
  deps.permissions.require(ctx, asPermission("restaurant.shifts.manage"));
  const validated = validateAddHandoffNotesInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.shiftId);
    const existing = deps.store.getShift(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "shift not found");
    assertSameTenant(ctx, existing.tenantId);
    const stamped = `[${new Date().toISOString()}] ${v.notes}`;
    const updated: Shift = {
      ...existing,
      handoffNotes: existing.handoffNotes ? `${existing.handoffNotes}\n${stamped}` : stamped,
      updatedAt: new Date().toISOString(),
    };
    deps.store.putShift(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-shift-management",
      action: "restaurant.shift.handoff_added", entityType: "shift", entityId: id,
      details: { notesLength: v.notes.length },
    }));
    return ok(updated);
}
