/**
 * Input validation helpers for the retail-point-of-sale component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCheckoutInput(input: CheckoutInput): Result<CheckoutInput> {
  if (input.itemsJson === undefined || input.itemsJson === null || (typeof input.itemsJson === "string" && input.itemsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "itemsJson is required");
  }
  if (input.discountCents === undefined || input.discountCents === null) {
    return err(ErrorCode.INVALID_INPUT, "discountCents is required");
  }
  if (!Number.isInteger(input.discountCents) || input.discountCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "discountCents must be a non-negative integer");
  }
  if (input.paymentMethod === undefined || input.paymentMethod === null) {
    return err(ErrorCode.INVALID_INPUT, "paymentMethod is required");
  }
  if (!["cash", "card", "mobile_money", "bank_transfer"].includes(input.paymentMethod)) {
    return err(ErrorCode.INVALID_INPUT, `paymentMethod must be one of: "cash", "card", "mobile_money", "bank_transfer"`);
  }
  return ok(input);
}

export function validateGetSaleInput(input: GetSaleInput): Result<GetSaleInput> {
  if (input.saleId === undefined || input.saleId === null || (typeof input.saleId === "string" && input.saleId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "saleId is required");
  }
  return ok(input);
}

export interface CheckoutInput {
  readonly itemsJson: string;
  readonly discountCents: number;
  readonly paymentMethod: string;
  readonly paymentReference?: string;
}

export interface GetSaleInput {
  readonly saleId: string;
}
