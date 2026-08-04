/**
 * Input validation helpers for the clinic-medical-records component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateRecordInput(input: CreateRecordInput): Result<CreateRecordInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.doctorStaffId === undefined || input.doctorStaffId === null || (typeof input.doctorStaffId === "string" && input.doctorStaffId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "doctorStaffId is required");
  }
  if (input.consultationNotes === undefined || input.consultationNotes === null || (typeof input.consultationNotes === "string" && input.consultationNotes.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "consultationNotes is required");
  }
  if (input.appointmentId !== undefined && input.appointmentId !== null) {
  }
  return ok(input);
}

export function validateListRecordsForPatientInput(input: ListRecordsForPatientInput): Result<ListRecordsForPatientInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  return ok(input);
}

export interface CreateRecordInput {
  readonly patientId: string;
  readonly doctorStaffId: string;
  readonly consultationNotes: string;
  readonly diagnosis?: string;
  readonly treatmentPlan?: string;
  readonly appointmentId?: string;
}

export interface ListRecordsForPatientInput {
  readonly patientId: string;
}
