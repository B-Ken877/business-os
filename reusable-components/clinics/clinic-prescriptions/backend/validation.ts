/**
 * Input validation helpers for the clinic-prescriptions component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreatePrescriptionInput(input: CreatePrescriptionInput): Result<CreatePrescriptionInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.doctorStaffId === undefined || input.doctorStaffId === null || (typeof input.doctorStaffId === "string" && input.doctorStaffId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "doctorStaffId is required");
  }
  if (input.medicationName === undefined || input.medicationName === null || (typeof input.medicationName === "string" && input.medicationName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "medicationName is required");
  }
  if (input.dosage === undefined || input.dosage === null || (typeof input.dosage === "string" && input.dosage.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "dosage is required");
  }
  if (input.durationDays === undefined || input.durationDays === null) {
    return err(ErrorCode.INVALID_INPUT, "durationDays is required");
  }
  if (!Number.isInteger(input.durationDays) || input.durationDays <= 0) {
    return err(ErrorCode.INVALID_INPUT, "durationDays must be a positive integer");
  }
  if (input.refillsRemaining === undefined || input.refillsRemaining === null) {
    return err(ErrorCode.INVALID_INPUT, "refillsRemaining is required");
  }
  if (!Number.isInteger(input.refillsRemaining) || input.refillsRemaining < 0) {
    return err(ErrorCode.INVALID_INPUT, "refillsRemaining must be a non-negative integer");
  }
  if (input.medicalRecordId !== undefined && input.medicalRecordId !== null) {
  }
  return ok(input);
}

export function validateRefillPrescriptionInput(input: RefillPrescriptionInput): Result<RefillPrescriptionInput> {
  if (input.prescriptionId === undefined || input.prescriptionId === null || (typeof input.prescriptionId === "string" && input.prescriptionId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "prescriptionId is required");
  }
  return ok(input);
}

export interface CreatePrescriptionInput {
  readonly patientId: string;
  readonly doctorStaffId: string;
  readonly medicationName: string;
  readonly dosage: string;
  readonly durationDays: number;
  readonly refillsRemaining: number;
  readonly medicalRecordId?: string;
}

export interface RefillPrescriptionInput {
  readonly prescriptionId: string;
}
