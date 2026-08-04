/**
 * Business logic for the service-scheduling component.
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
  StaffAvailability,
  TimeOff,
} from "./types";

import {
  type SetWorkingHoursInput,
  validateSetWorkingHoursInput,
  type IsAvailableInput,
  validateIsAvailableInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceSchedulingStore {
  getStaffAvailability(tenantId: string, id: EntityId): StaffAvailability | undefined;
  putStaffAvailability(tenantId: string, entity: StaffAvailability): void;
  listStaffAvailabilitys(tenantId: string): readonly StaffAvailability[];
  deleteStaffAvailability(tenantId: string, id: EntityId): boolean;
  getTimeOff(tenantId: string, id: EntityId): TimeOff | undefined;
  putTimeOff(tenantId: string, entity: TimeOff): void;
  listTimeOffs(tenantId: string): readonly TimeOff[];
  deleteTimeOff(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceSchedulingStore implements ServiceSchedulingStore {
  private readonly staffAvailabilitys = new Map<string, Map<string, StaffAvailability>>();
  private readonly timeOffs = new Map<string, Map<string, TimeOff>>();

  getStaffAvailability(tenantId: string, id: EntityId): StaffAvailability | undefined {
    return this.staffAvailabilitys.get(tenantId)?.get(id);
  }
  putStaffAvailability(tenantId: string, entity: StaffAvailability): void {
    let byId = this.staffAvailabilitys.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.staffAvailabilitys.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listStaffAvailabilitys(tenantId: string): readonly StaffAvailability[] {
    const byId = this.staffAvailabilitys.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteStaffAvailability(tenantId: string, id: EntityId): boolean {
    return this.staffAvailabilitys.get(tenantId)?.delete(id) ?? false;
  }

  getTimeOff(tenantId: string, id: EntityId): TimeOff | undefined {
    return this.timeOffs.get(tenantId)?.get(id);
  }
  putTimeOff(tenantId: string, entity: TimeOff): void {
    let byId = this.timeOffs.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.timeOffs.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listTimeOffs(tenantId: string): readonly TimeOff[] {
    const byId = this.timeOffs.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteTimeOff(tenantId: string, id: EntityId): boolean {
    return this.timeOffs.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ServiceSchedulingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultWorkingStartHour: number;
  readonly defaultWorkingEndHour: number;
}

//////////////////////////////////////////////////////////////////////
// setWorkingHours — Set a staff member's working hours for a day.
//////////////////////////////////////////////////////////////////////
export function setWorkingHours(
  ctx: TenantContext,
  deps: Dependencies,
  input: SetWorkingHoursInput
): Result<StaffAvailability> {
  deps.permissions.require(ctx, asPermission("service.scheduling.manage"));
  const validated = validateSetWorkingHoursInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.dayOfWeek < 1 || v.dayOfWeek > 7) {
      return err(ErrorCode.INVALID_INPUT, "dayOfWeek must be 1-7");
    }
    if (v.startHour >= v.endHour) {
      return err(ErrorCode.INVALID_INPUT, "startHour must be < endHour");
    }
    // Replace existing for the same staff + day.
    const existing = deps.store.listStaffAvailabilitys(ctx.tenantId)
      .find((a) => a.staffUserId === v.staffUserId && a.dayOfWeek === v.dayOfWeek);
    const id = existing?.id ?? asEntityId("sa_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const availability: StaffAvailability = {
      id, tenantId: ctx.tenantId, staffUserId: v.staffUserId,
      dayOfWeek: v.dayOfWeek, startHour: v.startHour, endHour: v.endHour,
      createdAt: existing?.createdAt ?? now, updatedAt: now,
    };
    deps.store.putStaffAvailability(ctx.tenantId, availability);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-scheduling",
      action: "service.scheduling.hours_set", entityType: "staff_availability", entityId: id,
      details: { staffUserId: v.staffUserId, dayOfWeek: v.dayOfWeek, startHour: v.startHour, endHour: v.endHour },
    }));
    return ok(availability);
}

//////////////////////////////////////////////////////////////////////
// isAvailable — Check if a staff member is available at a given time (within working hours and not on time off).
//////////////////////////////////////////////////////////////////////
export function isAvailable(
  ctx: TenantContext,
  deps: Dependencies,
  input: IsAvailableInput
): Result<boolean> {
  deps.permissions.require(ctx, asPermission("service.scheduling.read"));
  const validated = validateIsAvailableInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const at = new Date(v.at);
    const dayOfWeek = at.getDay() === 0 ? 7 : at.getDay();  // convert Sunday=0 to 7
    const hour = at.getHours();
    const workingHours = deps.store.listStaffAvailabilitys(ctx.tenantId)
      .find((a) => a.staffUserId === v.staffUserId && a.dayOfWeek === dayOfWeek);
    if (!workingHours) return ok(false);  // no working hours declared
    if (hour < workingHours.startHour || hour >= workingHours.endHour) {
      return ok(false);
    }
    // Check time off.
    const onTimeOff = deps.store.listTimeOffs(ctx.tenantId)
      .some((t) => t.staffUserId === v.staffUserId && t.startsAt <= v.at && t.endsAt > v.at);
    if (onTimeOff) return ok(false);
    return ok(true);
}
