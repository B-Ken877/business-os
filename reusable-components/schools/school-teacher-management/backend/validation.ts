/**
 * Input validation helpers for the school-teacher-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateTeacherInput(input: CreateTeacherInput): Result<CreateTeacherInput> {
  if (input.firstName === undefined || input.firstName === null || (typeof input.firstName === "string" && input.firstName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "firstName is required");
  }
  if (input.lastName === undefined || input.lastName === null || (typeof input.lastName === "string" && input.lastName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "lastName is required");
  }
  return ok(input);
}

export interface CreateTeacherInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string;
  readonly phone?: string;
  readonly subjectsJson?: string;
}
