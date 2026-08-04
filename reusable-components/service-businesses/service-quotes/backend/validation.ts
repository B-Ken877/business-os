/**
 * Input validation helpers for the service-quotes component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateQuoteInput(input: CreateQuoteInput): Result<CreateQuoteInput> {
  if (input.customerName === undefined || input.customerName === null || (typeof input.customerName === "string" && input.customerName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerName is required");
  }
  if (input.itemsJson === undefined || input.itemsJson === null || (typeof input.itemsJson === "string" && input.itemsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "itemsJson is required");
  }
  if (input.totalCents === undefined || input.totalCents === null) {
    return err(ErrorCode.INVALID_INPUT, "totalCents is required");
  }
  if (!Number.isInteger(input.totalCents) || input.totalCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "totalCents must be a non-negative integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  return ok(input);
}

export function validateApproveQuoteInput(input: ApproveQuoteInput): Result<ApproveQuoteInput> {
  if (input.quoteId === undefined || input.quoteId === null || (typeof input.quoteId === "string" && input.quoteId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "quoteId is required");
  }
  return ok(input);
}

export interface CreateQuoteInput {
  readonly customerName: string;
  readonly customerPhone?: string;
  readonly itemsJson: string;
  readonly totalCents: number;
  readonly currency: string;
}

export interface ApproveQuoteInput {
  readonly quoteId: string;
}
