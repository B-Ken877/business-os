/**
 * Input validation helpers for the clinic-appointments component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateScheduleAppointmentInput(input: ScheduleAppointmentInput): Result<ScheduleAppointmentInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.doctorStaffId === undefined || input.doctorStaffId === null || (typeof input.doctorStaffId === "string" && input.doctorStaffId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "doctorStaffId is required");
  }
  if (input.scheduledAt === undefined || input.scheduledAt === null) {
    return err(ErrorCode.INVALID_INPUT, "scheduledAt is required");
  }
  if (typeof input.scheduledAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.scheduledAt)) {
    return err(ErrorCode.INVALID_INPUT, "scheduledAt must be an ISO-8601 date");
  }
  if (input.durationMinutes === undefined || input.durationMinutes === null) {
    return err(ErrorCode.INVALID_INPUT, "durationMinutes is required");
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    return err(ErrorCode.INVALID_INPUT, "durationMinutes must be a positive integer");
  }
  return ok(input);
}

export function validateCancelAppointmentInput(input: CancelAppointmentInput): Result<CancelAppointmentInput> {
  if (input.appointmentId === undefined || input.appointmentId === null || (typeof input.appointmentId === "string" && input.appointmentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "appointmentId is required");
  }
  return ok(input);
}

export interface ScheduleAppointmentInput {
  readonly patientId: string;
  readonly doctorStaffId: string;
  readonly scheduledAt: string;
  readonly durationMinutes: number;
  readonly reason?: string;
}

export interface CancelAppointmentInput {
  readonly appointmentId: string;
}
