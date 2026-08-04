/**
 * Input validation helpers for the payments-or-collections component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordPaymentInput(input: RecordPaymentInput): Result<RecordPaymentInput> {
  if (input.amount === undefined || input.amount === null) {
    return err(ErrorCode.INVALID_INPUT, "amount is required");
  }
  if (!Number.isInteger(input.amount) || input.amount <= 0) {
    return err(ErrorCode.INVALID_INPUT, "amount must be a positive integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  if (input.method === undefined || input.method === null) {
    return err(ErrorCode.INVALID_INPUT, "method is required");
  }
  if (!["cash", "card", "mobile_money", "bank_transfer"].includes(input.method)) {
    return err(ErrorCode.INVALID_INPUT, `method must be one of: "cash", "card", "mobile_money", "bank_transfer"`);
  }
  if (input.invoiceId !== undefined && input.invoiceId !== null) {
  }
  return ok(input);
}

export function validateRefundPaymentInput(input: RefundPaymentInput): Result<RefundPaymentInput> {
  if (input.paymentId === undefined || input.paymentId === null || (typeof input.paymentId === "string" && input.paymentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "paymentId is required");
  }
  if (input.reason === undefined || input.reason === null || (typeof input.reason === "string" && input.reason.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "reason is required");
  }
  return ok(input);
}

export function validateListPaymentsForInvoiceInput(input: ListPaymentsForInvoiceInput): Result<ListPaymentsForInvoiceInput> {
  if (input.invoiceId === undefined || input.invoiceId === null || (typeof input.invoiceId === "string" && input.invoiceId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "invoiceId is required");
  }
  return ok(input);
}

export interface RecordPaymentInput {
  readonly amount: number;
  readonly currency: string;
  readonly method: string;
  readonly providerReference?: string;
  readonly invoiceId?: string;
  readonly payerName?: string;
}

export interface RefundPaymentInput {
  readonly paymentId: string;
  readonly reason: string;
}

export interface ListPaymentsForInvoiceInput {
  readonly invoiceId: string;
}
