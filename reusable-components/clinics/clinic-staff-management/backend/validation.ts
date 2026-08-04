/**
 * Input validation helpers for the clinic-staff-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateStaffInput(input: CreateStaffInput): Result<CreateStaffInput> {
  if (input.firstName === undefined || input.firstName === null || (typeof input.firstName === "string" && input.firstName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "firstName is required");
  }
  if (input.lastName === undefined || input.lastName === null || (typeof input.lastName === "string" && input.lastName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "lastName is required");
  }
  if (input.role === undefined || input.role === null) {
    return err(ErrorCode.INVALID_INPUT, "role is required");
  }
  if (!["doctor", "nurse", "assistant", "receptionist"].includes(input.role)) {
    return err(ErrorCode.INVALID_INPUT, `role must be one of: "doctor", "nurse", "assistant", "receptionist"`);
  }
  return ok(input);
}

export interface CreateStaffInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly role: string;
  readonly specialty?: string;
  readonly phone?: string;
  readonly email?: string;
}
