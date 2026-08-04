/**
 * Input validation helpers for the service-invoicing component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateGenerateInvoiceInput(input: GenerateInvoiceInput): Result<GenerateInvoiceInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.subtotalCents === undefined || input.subtotalCents === null) {
    return err(ErrorCode.INVALID_INPUT, "subtotalCents is required");
  }
  if (!Number.isInteger(input.subtotalCents) || input.subtotalCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "subtotalCents must be a non-negative integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  if (input.bookingId !== undefined && input.bookingId !== null) {
  }
  if (input.jobId !== undefined && input.jobId !== null) {
  }
  return ok(input);
}

export function validateMarkPaidInput(input: MarkPaidInput): Result<MarkPaidInput> {
  if (input.invoiceId === undefined || input.invoiceId === null || (typeof input.invoiceId === "string" && input.invoiceId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "invoiceId is required");
  }
  return ok(input);
}

export interface GenerateInvoiceInput {
  readonly customerId: string;
  readonly subtotalCents: number;
  readonly currency: string;
  readonly bookingId?: string;
  readonly jobId?: string;
}

export interface MarkPaidInput {
  readonly invoiceId: string;
}
