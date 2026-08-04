/**
 * Input validation helpers for the restaurant-shift-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateShiftInput(input: CreateShiftInput): Result<CreateShiftInput> {
  if (input.staffUserId === undefined || input.staffUserId === null || (typeof input.staffUserId === "string" && input.staffUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "staffUserId is required");
  }
  if (input.startsAt === undefined || input.startsAt === null) {
    return err(ErrorCode.INVALID_INPUT, "startsAt is required");
  }
  if (typeof input.startsAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.startsAt)) {
    return err(ErrorCode.INVALID_INPUT, "startsAt must be an ISO-8601 date");
  }
  if (input.endsAt === undefined || input.endsAt === null) {
    return err(ErrorCode.INVALID_INPUT, "endsAt is required");
  }
  if (typeof input.endsAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.endsAt)) {
    return err(ErrorCode.INVALID_INPUT, "endsAt must be an ISO-8601 date");
  }
  if (input.role === undefined || input.role === null || (typeof input.role === "string" && input.role.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "role is required");
  }
  return ok(input);
}

export function validateAddHandoffNotesInput(input: AddHandoffNotesInput): Result<AddHandoffNotesInput> {
  if (input.shiftId === undefined || input.shiftId === null || (typeof input.shiftId === "string" && input.shiftId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "shiftId is required");
  }
  if (input.notes === undefined || input.notes === null || (typeof input.notes === "string" && input.notes.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "notes is required");
  }
  return ok(input);
}

export interface CreateShiftInput {
  readonly staffUserId: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly role: string;
}

export interface AddHandoffNotesInput {
  readonly shiftId: string;
  readonly notes: string;
}
