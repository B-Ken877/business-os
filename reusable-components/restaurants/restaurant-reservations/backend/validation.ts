/**
 * Input validation helpers for the restaurant-reservations component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateReservationInput(input: CreateReservationInput): Result<CreateReservationInput> {
  if (input.customerName === undefined || input.customerName === null || (typeof input.customerName === "string" && input.customerName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerName is required");
  }
  if (input.partySize === undefined || input.partySize === null) {
    return err(ErrorCode.INVALID_INPUT, "partySize is required");
  }
  if (!Number.isInteger(input.partySize) || input.partySize <= 0) {
    return err(ErrorCode.INVALID_INPUT, "partySize must be a positive integer");
  }
  if (input.scheduledAt === undefined || input.scheduledAt === null) {
    return err(ErrorCode.INVALID_INPUT, "scheduledAt is required");
  }
  if (typeof input.scheduledAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.scheduledAt)) {
    return err(ErrorCode.INVALID_INPUT, "scheduledAt must be an ISO-8601 date");
  }
  return ok(input);
}

export function validateCancelReservationInput(input: CancelReservationInput): Result<CancelReservationInput> {
  if (input.reservationId === undefined || input.reservationId === null || (typeof input.reservationId === "string" && input.reservationId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "reservationId is required");
  }
  return ok(input);
}

export interface CreateReservationInput {
  readonly customerName: string;
  readonly customerPhone?: string;
  readonly partySize: number;
  readonly scheduledAt: string;
}

export interface CancelReservationInput {
  readonly reservationId: string;
}
