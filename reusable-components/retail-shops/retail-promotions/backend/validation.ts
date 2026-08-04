/**
 * Input validation helpers for the retail-promotions component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreatePromotionInput(input: CreatePromotionInput): Result<CreatePromotionInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.discountType === undefined || input.discountType === null) {
    return err(ErrorCode.INVALID_INPUT, "discountType is required");
  }
  if (!["percentage", "fixed", "bundle"].includes(input.discountType)) {
    return err(ErrorCode.INVALID_INPUT, `discountType must be one of: "percentage", "fixed", "bundle"`);
  }
  if (input.discountValue === undefined || input.discountValue === null) {
    return err(ErrorCode.INVALID_INPUT, "discountValue is required");
  }
  if (!Number.isInteger(input.discountValue) || input.discountValue < 0) {
    return err(ErrorCode.INVALID_INPUT, "discountValue must be a non-negative integer");
  }
  if (input.scopeJson === undefined || input.scopeJson === null || (typeof input.scopeJson === "string" && input.scopeJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "scopeJson is required");
  }
  if (input.startsAt === undefined || input.startsAt === null) {
    return err(ErrorCode.INVALID_INPUT, "startsAt is required");
  }
  if (typeof input.startsAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.startsAt)) {
    return err(ErrorCode.INVALID_INPUT, "startsAt must be an ISO-8601 date");
  }
  if (input.endsAt === undefined || input.endsAt === null) {
    return err(ErrorCode.INVALID_INPUT, "endsAt is required");
  }
  if (typeof input.endsAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.endsAt)) {
    return err(ErrorCode.INVALID_INPUT, "endsAt must be an ISO-8601 date");
  }
  return ok(input);
}

export function validateActivatePromotionInput(input: ActivatePromotionInput): Result<ActivatePromotionInput> {
  if (input.promotionId === undefined || input.promotionId === null || (typeof input.promotionId === "string" && input.promotionId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "promotionId is required");
  }
  return ok(input);
}

export interface CreatePromotionInput {
  readonly name: string;
  readonly discountType: string;
  readonly discountValue: number;
  readonly scopeJson: string;
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface ActivatePromotionInput {
  readonly promotionId: string;
}
