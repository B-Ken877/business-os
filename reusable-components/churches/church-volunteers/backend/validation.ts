/**
 * Input validation helpers for the church-volunteers component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateVolunteerInput(input: CreateVolunteerInput): Result<CreateVolunteerInput> {
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  if (input.role === undefined || input.role === null || (typeof input.role === "string" && input.role.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "role is required");
  }
  return ok(input);
}

export function validateAssignVolunteerInput(input: AssignVolunteerInput): Result<AssignVolunteerInput> {
  if (input.volunteerId === undefined || input.volunteerId === null || (typeof input.volunteerId === "string" && input.volunteerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "volunteerId is required");
  }
  if (input.assignmentType === undefined || input.assignmentType === null || (typeof input.assignmentType === "string" && input.assignmentType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "assignmentType is required");
  }
  if (input.assignmentId === undefined || input.assignmentId === null || (typeof input.assignmentId === "string" && input.assignmentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "assignmentId is required");
  }
  return ok(input);
}

export interface CreateVolunteerInput {
  readonly memberId: string;
  readonly role: string;
}

export interface AssignVolunteerInput {
  readonly volunteerId: string;
  readonly assignmentType: string;
  readonly assignmentId: string;
}
