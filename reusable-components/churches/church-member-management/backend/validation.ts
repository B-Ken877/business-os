/**
 * Input validation helpers for the church-member-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateMemberInput(input: CreateMemberInput): Result<CreateMemberInput> {
  if (input.firstName === undefined || input.firstName === null || (typeof input.firstName === "string" && input.firstName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "firstName is required");
  }
  if (input.lastName === undefined || input.lastName === null || (typeof input.lastName === "string" && input.lastName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "lastName is required");
  }
  if (input.familyId !== undefined && input.familyId !== null) {
  }
  if (input.directoryVisibility === undefined || input.directoryVisibility === null) {
    return err(ErrorCode.INVALID_INPUT, "directoryVisibility is required");
  }
  if (!["visible", "hidden"].includes(input.directoryVisibility)) {
    return err(ErrorCode.INVALID_INPUT, `directoryVisibility must be one of: "visible", "hidden"`);
  }
  return ok(input);
}

export function validateUpdateOwnVisibilityInput(input: UpdateOwnVisibilityInput): Result<UpdateOwnVisibilityInput> {
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  if (input.visibility === undefined || input.visibility === null) {
    return err(ErrorCode.INVALID_INPUT, "visibility is required");
  }
  if (!["visible", "hidden"].includes(input.visibility)) {
    return err(ErrorCode.INVALID_INPUT, `visibility must be one of: "visible", "hidden"`);
  }
  return ok(input);
}

export interface CreateMemberInput {
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly email?: string;
  readonly familyId?: string;
  readonly directoryVisibility: string;
}

export interface UpdateOwnVisibilityInput {
  readonly memberId: string;
  readonly visibility: string;
}
