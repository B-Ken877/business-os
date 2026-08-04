/**
 * Input validation helpers for the service-booking component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateBookingInput(input: CreateBookingInput): Result<CreateBookingInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.serviceId === undefined || input.serviceId === null || (typeof input.serviceId === "string" && input.serviceId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "serviceId is required");
  }
  if (input.staffUserId === undefined || input.staffUserId === null || (typeof input.staffUserId === "string" && input.staffUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "staffUserId is required");
  }
  if (input.scheduledAt === undefined || input.scheduledAt === null) {
    return err(ErrorCode.INVALID_INPUT, "scheduledAt is required");
  }
  if (typeof input.scheduledAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.scheduledAt)) {
    return err(ErrorCode.INVALID_INPUT, "scheduledAt must be an ISO-8601 date");
  }
  if (input.durationMinutes === undefined || input.durationMinutes === null) {
    return err(ErrorCode.INVALID_INPUT, "durationMinutes is required");
  }
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes <= 0) {
    return err(ErrorCode.INVALID_INPUT, "durationMinutes must be a positive integer");
  }
  return ok(input);
}

export function validateMarkCompletedInput(input: MarkCompletedInput): Result<MarkCompletedInput> {
  if (input.bookingId === undefined || input.bookingId === null || (typeof input.bookingId === "string" && input.bookingId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "bookingId is required");
  }
  return ok(input);
}

export function validateMarkNoShowInput(input: MarkNoShowInput): Result<MarkNoShowInput> {
  if (input.bookingId === undefined || input.bookingId === null || (typeof input.bookingId === "string" && input.bookingId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "bookingId is required");
  }
  return ok(input);
}

export interface CreateBookingInput {
  readonly customerId: string;
  readonly serviceId: string;
  readonly staffUserId: string;
  readonly scheduledAt: string;
  readonly durationMinutes: number;
}

export interface MarkCompletedInput {
  readonly bookingId: string;
}

export interface MarkNoShowInput {
  readonly bookingId: string;
}
