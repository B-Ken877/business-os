/**
 * Input validation helpers for the retail-barcode-scanning component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRegisterBarcodeInput(input: RegisterBarcodeInput): Result<RegisterBarcodeInput> {
  if (input.code === undefined || input.code === null || (typeof input.code === "string" && input.code.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "code is required");
  }
  if (input.format === undefined || input.format === null || (typeof input.format === "string" && input.format.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "format is required");
  }
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  return ok(input);
}

export function validateLookupBarcodeInput(input: LookupBarcodeInput): Result<LookupBarcodeInput> {
  if (input.code === undefined || input.code === null || (typeof input.code === "string" && input.code.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "code is required");
  }
  return ok(input);
}

export interface RegisterBarcodeInput {
  readonly code: string;
  readonly format: string;
  readonly productId: string;
}

export interface LookupBarcodeInput {
  readonly code: string;
}
