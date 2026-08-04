/**
 * Input validation helpers for the clinic-patient-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreatePatientInput(input: CreatePatientInput): Result<CreatePatientInput> {
  if (input.firstName === undefined || input.firstName === null || (typeof input.firstName === "string" && input.firstName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "firstName is required");
  }
  if (input.lastName === undefined || input.lastName === null || (typeof input.lastName === "string" && input.lastName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "lastName is required");
  }
  if (input.dateOfBirth === undefined || input.dateOfBirth === null) {
    return err(ErrorCode.INVALID_INPUT, "dateOfBirth is required");
  }
  if (typeof input.dateOfBirth !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.dateOfBirth)) {
    return err(ErrorCode.INVALID_INPUT, "dateOfBirth must be an ISO-8601 date");
  }
  if (input.medicalRecordNumber === undefined || input.medicalRecordNumber === null || (typeof input.medicalRecordNumber === "string" && input.medicalRecordNumber.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "medicalRecordNumber is required");
  }
  return ok(input);
}

export function validateGetPatientInput(input: GetPatientInput): Result<GetPatientInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  return ok(input);
}

export interface CreatePatientInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly medicalRecordNumber: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
}

export interface GetPatientInput {
  readonly patientId: string;
}
