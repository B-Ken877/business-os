/**
 * Input validation helpers for the service-scheduling component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateSetWorkingHoursInput(input: SetWorkingHoursInput): Result<SetWorkingHoursInput> {
  if (input.staffUserId === undefined || input.staffUserId === null || (typeof input.staffUserId === "string" && input.staffUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "staffUserId is required");
  }
  if (input.dayOfWeek === undefined || input.dayOfWeek === null) {
    return err(ErrorCode.INVALID_INPUT, "dayOfWeek is required");
  }
  if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek <= 0) {
    return err(ErrorCode.INVALID_INPUT, "dayOfWeek must be a positive integer");
  }
  if (input.startHour === undefined || input.startHour === null) {
    return err(ErrorCode.INVALID_INPUT, "startHour is required");
  }
  if (!Number.isInteger(input.startHour) || input.startHour < 0) {
    return err(ErrorCode.INVALID_INPUT, "startHour must be a non-negative integer");
  }
  if (input.endHour === undefined || input.endHour === null) {
    return err(ErrorCode.INVALID_INPUT, "endHour is required");
  }
  if (!Number.isInteger(input.endHour) || input.endHour <= 0) {
    return err(ErrorCode.INVALID_INPUT, "endHour must be a positive integer");
  }
  return ok(input);
}

export function validateIsAvailableInput(input: IsAvailableInput): Result<IsAvailableInput> {
  if (input.staffUserId === undefined || input.staffUserId === null || (typeof input.staffUserId === "string" && input.staffUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "staffUserId is required");
  }
  if (input.at === undefined || input.at === null) {
    return err(ErrorCode.INVALID_INPUT, "at is required");
  }
  if (typeof input.at !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.at)) {
    return err(ErrorCode.INVALID_INPUT, "at must be an ISO-8601 date");
  }
  return ok(input);
}

export interface SetWorkingHoursInput {
  readonly staffUserId: string;
  readonly dayOfWeek: number;
  readonly startHour: number;
  readonly endHour: number;
}

export interface IsAvailableInput {
  readonly staffUserId: string;
  readonly at: string;
}
