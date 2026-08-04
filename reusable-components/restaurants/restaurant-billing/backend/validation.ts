/**
 * Input validation helpers for the restaurant-billing component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateGenerateBillInput(input: GenerateBillInput): Result<GenerateBillInput> {
  if (input.orderIdsJson === undefined || input.orderIdsJson === null || (typeof input.orderIdsJson === "string" && input.orderIdsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "orderIdsJson is required");
  }
  if (input.tipCents === undefined || input.tipCents === null) {
    return err(ErrorCode.INVALID_INPUT, "tipCents is required");
  }
  if (!Number.isInteger(input.tipCents) || input.tipCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "tipCents must be a non-negative integer");
  }
  return ok(input);
}

export function validateMarkPaidInput(input: MarkPaidInput): Result<MarkPaidInput> {
  if (input.billId === undefined || input.billId === null || (typeof input.billId === "string" && input.billId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "billId is required");
  }
  return ok(input);
}

export interface GenerateBillInput {
  readonly orderIdsJson: string;
  readonly tipCents: number;
}

export interface MarkPaidInput {
  readonly billId: string;
}
