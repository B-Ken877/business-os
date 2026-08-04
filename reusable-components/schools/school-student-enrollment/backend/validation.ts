/**
 * Input validation helpers for the school-student-enrollment component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateEnrollStudentInput(input: EnrollStudentInput): Result<EnrollStudentInput> {
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
  if (input.guardianName === undefined || input.guardianName === null || (typeof input.guardianName === "string" && input.guardianName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "guardianName is required");
  }
  return ok(input);
}

export function validateUpdateEnrollmentStatusInput(input: UpdateEnrollmentStatusInput): Result<UpdateEnrollmentStatusInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.newStatus === undefined || input.newStatus === null) {
    return err(ErrorCode.INVALID_INPUT, "newStatus is required");
  }
  if (!["applicant", "enrolled", "withdrawn", "graduated"].includes(input.newStatus)) {
    return err(ErrorCode.INVALID_INPUT, `newStatus must be one of: "applicant", "enrolled", "withdrawn", "graduated"`);
  }
  return ok(input);
}

export interface EnrollStudentInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly dateOfBirth: string;
  readonly guardianName: string;
  readonly guardianPhone?: string;
}

export interface UpdateEnrollmentStatusInput {
  readonly studentId: string;
  readonly newStatus: string;
}
