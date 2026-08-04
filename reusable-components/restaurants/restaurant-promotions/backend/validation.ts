/**
 * Input validation helpers for the restaurant-promotions component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateCouponInput(input: CreateCouponInput): Result<CreateCouponInput> {
  if (input.code === undefined || input.code === null || (typeof input.code === "string" && input.code.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "code is required");
  }
  if (input.discountType === undefined || input.discountType === null) {
    return err(ErrorCode.INVALID_INPUT, "discountType is required");
  }
  if (!["percentage", "fixed"].includes(input.discountType)) {
    return err(ErrorCode.INVALID_INPUT, `discountType must be one of: "percentage", "fixed"`);
  }
  if (input.discountValue === undefined || input.discountValue === null) {
    return err(ErrorCode.INVALID_INPUT, "discountValue is required");
  }
  if (!Number.isInteger(input.discountValue) || input.discountValue < 0) {
    return err(ErrorCode.INVALID_INPUT, "discountValue must be a non-negative integer");
  }
  if (input.maxRedemptions === undefined || input.maxRedemptions === null) {
    return err(ErrorCode.INVALID_INPUT, "maxRedemptions is required");
  }
  if (!Number.isInteger(input.maxRedemptions) || input.maxRedemptions < 0) {
    return err(ErrorCode.INVALID_INPUT, "maxRedemptions must be a non-negative integer");
  }
  return ok(input);
}

export function validateRedeemCouponInput(input: RedeemCouponInput): Result<RedeemCouponInput> {
  if (input.code === undefined || input.code === null || (typeof input.code === "string" && input.code.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "code is required");
  }
  return ok(input);
}

export interface CreateCouponInput {
  readonly code: string;
  readonly discountType: string;
  readonly discountValue: number;
  readonly maxRedemptions: number;
}

export interface RedeemCouponInput {
  readonly code: string;
}
