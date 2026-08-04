/**
 * Input validation helpers for the service-feedback component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateSubmitFeedbackInput(input: SubmitFeedbackInput): Result<SubmitFeedbackInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.bookingId === undefined || input.bookingId === null || (typeof input.bookingId === "string" && input.bookingId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "bookingId is required");
  }
  if (input.rating === undefined || input.rating === null) {
    return err(ErrorCode.INVALID_INPUT, "rating is required");
  }
  if (!Number.isInteger(input.rating) || input.rating <= 0) {
    return err(ErrorCode.INVALID_INPUT, "rating must be a positive integer");
  }
  return ok(input);
}

export interface SubmitFeedbackInput {
  readonly customerId: string;
  readonly bookingId: string;
  readonly rating: number;
  readonly comment?: string;
}
