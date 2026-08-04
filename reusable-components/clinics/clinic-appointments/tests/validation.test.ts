import { describe, it, expect } from "vitest";
import { isOk, isErr } from "@business-os/shared";
import {
  validateScheduleAppointmentInput,
  type ScheduleAppointmentInput,
  validateCancelAppointmentInput,
  type CancelAppointmentInput,
} from "../backend/validation";

describe("clinic-appointments / validateScheduleAppointmentInput", () => {
  it("accepts a valid input", () => {
    const input: ScheduleAppointmentInput = {
    patientId: "ent_test",
    doctorStaffId: "ent_test",
    scheduledAt: "2024-01-15",
    durationMinutes: 1,
    reason: undefined,
    };
    const r = validateScheduleAppointmentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when patientId is missing", () => {
    const input = {
      doctorStaffId: "ent_test",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
      reason: undefined,
    } as any;
    const r = validateScheduleAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when doctorStaffId is missing", () => {
    const input = {
      patientId: "ent_test",
      scheduledAt: "2024-01-15",
      durationMinutes: 1,
      reason: undefined,
    } as any;
    const r = validateScheduleAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledAt is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      durationMinutes: 1,
      reason: undefined,
    } as any;
    const r = validateScheduleAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationMinutes is missing", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      scheduledAt: "2024-01-15",
      reason: undefined,
    } as any;
    const r = validateScheduleAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when scheduledAt violates iso-date", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      scheduledAt: "not-a-date",
      durationMinutes: 1,
      reason: undefined,
    } as any;
    const r = validateScheduleAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects when durationMinutes violates positive-integer", () => {
    const input = {
      patientId: "ent_test",
      doctorStaffId: "ent_test",
      scheduledAt: "2024-01-15",
      durationMinutes: -1,
      reason: undefined,
    } as any;
    const r = validateScheduleAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});

describe("clinic-appointments / validateCancelAppointmentInput", () => {
  it("accepts a valid input", () => {
    const input: CancelAppointmentInput = {
    appointmentId: "ent_test",
    };
    const r = validateCancelAppointmentInput(input);
    expect(isOk(r)).toBe(true);
  });
  it("rejects when appointmentId is missing", () => {
    const input = {
    } as any;
    const r = validateCancelAppointmentInput(input);
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
