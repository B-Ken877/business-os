/**
 * Input validation helpers for the retail-stock-alerts component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateEvaluateStockLevelInput(input: EvaluateStockLevelInput): Result<EvaluateStockLevelInput> {
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  if (input.currentQuantity === undefined || input.currentQuantity === null) {
    return err(ErrorCode.INVALID_INPUT, "currentQuantity is required");
  }
  if (!Number.isInteger(input.currentQuantity) || input.currentQuantity < 0) {
    return err(ErrorCode.INVALID_INPUT, "currentQuantity must be a non-negative integer");
  }
  if (input.threshold === undefined || input.threshold === null) {
    return err(ErrorCode.INVALID_INPUT, "threshold is required");
  }
  if (!Number.isInteger(input.threshold) || input.threshold < 0) {
    return err(ErrorCode.INVALID_INPUT, "threshold must be a non-negative integer");
  }
  return ok(input);
}

export interface EvaluateStockLevelInput {
  readonly productId: string;
  readonly currentQuantity: number;
  readonly threshold: number;
}
