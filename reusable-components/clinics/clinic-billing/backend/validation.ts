/**
 * Input validation helpers for the clinic-billing component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateGenerateInvoiceInput(input: GenerateInvoiceInput): Result<GenerateInvoiceInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.amountCents === undefined || input.amountCents === null) {
    return err(ErrorCode.INVALID_INPUT, "amountCents is required");
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
    return err(ErrorCode.INVALID_INPUT, "amountCents must be a positive integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  if (input.appointmentId !== undefined && input.appointmentId !== null) {
  }
  return ok(input);
}

export function validateMarkInvoicePaidInput(input: MarkInvoicePaidInput): Result<MarkInvoicePaidInput> {
  if (input.invoiceId === undefined || input.invoiceId === null || (typeof input.invoiceId === "string" && input.invoiceId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "invoiceId is required");
  }
  return ok(input);
}

export interface GenerateInvoiceInput {
  readonly patientId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly appointmentId?: string;
}

export interface MarkInvoicePaidInput {
  readonly invoiceId: string;
}
