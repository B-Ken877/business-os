/**
 * Input validation helpers for the retail-inventory component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateAdjustStockInput(input: AdjustStockInput): Result<AdjustStockInput> {
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  if (input.delta === undefined || input.delta === null) {
    return err(ErrorCode.INVALID_INPUT, "delta is required");
  }
  if (input.reason === undefined || input.reason === null || (typeof input.reason === "string" && input.reason.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "reason is required");
  }
  return ok(input);
}

export function validateSetLowStockThresholdInput(input: SetLowStockThresholdInput): Result<SetLowStockThresholdInput> {
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  if (input.threshold === undefined || input.threshold === null) {
    return err(ErrorCode.INVALID_INPUT, "threshold is required");
  }
  if (!Number.isInteger(input.threshold) || input.threshold < 0) {
    return err(ErrorCode.INVALID_INPUT, "threshold must be a non-negative integer");
  }
  return ok(input);
}

export function validateListMovementsForProductInput(input: ListMovementsForProductInput): Result<ListMovementsForProductInput> {
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  return ok(input);
}

export interface AdjustStockInput {
  readonly productId: string;
  readonly delta: number;
  readonly reason: string;
  readonly reference?: string;
}

export interface SetLowStockThresholdInput {
  readonly productId: string;
  readonly threshold: number;
}

export interface ListMovementsForProductInput {
  readonly productId: string;
}
