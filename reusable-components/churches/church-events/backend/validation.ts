/**
 * Input validation helpers for the church-events component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateEventInput(input: CreateEventInput): Result<CreateEventInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
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
  if (input.capacity === undefined || input.capacity === null) {
    return err(ErrorCode.INVALID_INPUT, "capacity is required");
  }
  if (!Number.isInteger(input.capacity) || input.capacity < 0) {
    return err(ErrorCode.INVALID_INPUT, "capacity must be a non-negative integer");
  }
  return ok(input);
}

export function validateRegisterForMemberInput(input: RegisterForMemberInput): Result<RegisterForMemberInput> {
  if (input.eventId === undefined || input.eventId === null || (typeof input.eventId === "string" && input.eventId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "eventId is required");
  }
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  return ok(input);
}

export interface CreateEventInput {
  readonly name: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location?: string;
  readonly capacity: number;
}

export interface RegisterForMemberInput {
  readonly eventId: string;
  readonly memberId: string;
}
