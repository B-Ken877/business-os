import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryClinicAppointmentsStore,
  scheduleAppointment,
  cancelAppointment,
  defaultConfig,
  type Appointment,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicAppointmentsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.appointments.schedule",
    "clinic.appointments.read",
    "clinic.appointments.cancel",
    "clinic.appointments.reschedule",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-appointments / scheduleAppointment", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      scheduleAppointment(ctx, denyDeps, { patientId: "ent_test", doctorStaffId: "ent_test", scheduledAt: "2024-01-15", durationMinutes: 1, reason: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-appointments / cancelAppointment", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      cancelAppointment(ctx, denyDeps, { appointmentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-appointments / schedule + cancel rules", () => {
  it("schedules and cancels an appointment", () => {
    const { ctx, deps } = setup();
    const a = scheduleAppointment(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    expect(isOk(a)).toBe(true);
    if (!a.ok) return;
    expect(a.value.status).toBe("scheduled");
    const c = cancelAppointment(ctx, deps, { appointmentId: a.value.id });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    expect(c.value.status).toBe("cancelled");
  });
  it("detects doctor scheduling conflicts", () => {
    const { ctx, deps } = setup();
    scheduleAppointment(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    // Overlapping appointment for the same doctor.
    const r = scheduleAppointment(ctx, deps, {
      patientId: "ent_p2", doctorStaffId: "ent_d1",
      scheduledAt: "2024-06-01T10:15:00Z", durationMinutes: 30,
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
  it("allows back-to-back non-overlapping appointments", () => {
    const { ctx, deps } = setup();
    scheduleAppointment(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    const r = scheduleAppointment(ctx, deps, {
      patientId: "ent_p2", doctorStaffId: "ent_d1",
      scheduledAt: "2024-06-01T10:30:00Z", durationMinutes: 30,
    });
    expect(isOk(r)).toBe(true);
  });
});
