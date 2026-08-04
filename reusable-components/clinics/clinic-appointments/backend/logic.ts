/**
 * Business logic for the clinic-appointments component.
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
  Appointment,
} from "./types";

import {
  type ScheduleAppointmentInput,
  validateScheduleAppointmentInput,
  type CancelAppointmentInput,
  validateCancelAppointmentInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicAppointmentsStore {
  getAppointment(tenantId: string, id: EntityId): Appointment | undefined;
  putAppointment(tenantId: string, entity: Appointment): void;
  listAppointments(tenantId: string): readonly Appointment[];
  deleteAppointment(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicAppointmentsStore implements ClinicAppointmentsStore {
  private readonly appointments = new Map<string, Map<string, Appointment>>();

  getAppointment(tenantId: string, id: EntityId): Appointment | undefined {
    return this.appointments.get(tenantId)?.get(id);
  }
  putAppointment(tenantId: string, entity: Appointment): void {
    let byId = this.appointments.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.appointments.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listAppointments(tenantId: string): readonly Appointment[] {
    const byId = this.appointments.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteAppointment(tenantId: string, id: EntityId): boolean {
    return this.appointments.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicAppointmentsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly slotDurationMinutes: number;
  readonly reminderLeadMinutes: number;
}

//////////////////////////////////////////////////////////////////////
// scheduleAppointment — Schedule a new appointment. Detects doctor double-booking.
//////////////////////////////////////////////////////////////////////
export function scheduleAppointment(
  ctx: TenantContext,
  deps: Dependencies,
  input: ScheduleAppointmentInput
): Result<Appointment> {
  deps.permissions.require(ctx, asPermission("clinic.appointments.schedule"));
  const validated = validateScheduleAppointmentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Conflict detection: doctor cannot have overlapping appointments.
    const start = new Date(v.scheduledAt).getTime();
    const end = start + v.durationMinutes * 60 * 1000;
    const all = deps.store.listAppointments(ctx.tenantId);
    const conflict = all.some((a) => {
      if (a.doctorStaffId !== v.doctorStaffId) return false;
      if (a.status === "cancelled") return false;
      const aStart = new Date(a.scheduledAt).getTime();
      const aEnd = aStart + a.durationMinutes * 60 * 1000;
      return start < aEnd && end > aStart;  // overlap
    });
    if (conflict) {
      return err(ErrorCode.CONFLICT, "doctor has an overlapping appointment");
    }
    const id = asEntityId("apt_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const appointment: Appointment = {
      id, tenantId: ctx.tenantId, patientId: v.patientId, doctorStaffId: v.doctorStaffId,
      scheduledAt: v.scheduledAt, durationMinutes: v.durationMinutes,
      reason: v.reason ?? null, status: "scheduled", createdAt: now, updatedAt: now,
    };
    deps.store.putAppointment(ctx.tenantId, appointment);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-appointments",
      action: "clinic.appointment.scheduled", entityType: "appointment", entityId: id,
      details: { patientId: v.patientId, doctorStaffId: v.doctorStaffId, scheduledAt: v.scheduledAt },
    }));
    return ok(appointment);
}

//////////////////////////////////////////////////////////////////////
// cancelAppointment — Cancel an appointment.
//////////////////////////////////////////////////////////////////////
export function cancelAppointment(
  ctx: TenantContext,
  deps: Dependencies,
  input: CancelAppointmentInput
): Result<Appointment> {
  deps.permissions.require(ctx, asPermission("clinic.appointments.cancel"));
  const validated = validateCancelAppointmentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.appointmentId);
    const existing = deps.store.getAppointment(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "appointment not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "cancelled") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "appointment already cancelled");
    }
    if (existing.status === "completed") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot cancel a completed appointment");
    }
    const updated: Appointment = {
      ...existing, status: "cancelled", updatedAt: new Date().toISOString(),
    };
    deps.store.putAppointment(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-appointments",
      action: "clinic.appointment.cancelled", entityType: "appointment", entityId: id, details: {},
    }));
    return ok(updated);
}
