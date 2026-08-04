/**
 * Input validation helpers for the restaurant-menu component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateMenuItemInput(input: CreateMenuItemInput): Result<CreateMenuItemInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.categoryId === undefined || input.categoryId === null || (typeof input.categoryId === "string" && input.categoryId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "categoryId is required");
  }
  if (input.priceCents === undefined || input.priceCents === null) {
    return err(ErrorCode.INVALID_INPUT, "priceCents is required");
  }
  if (!Number.isInteger(input.priceCents) || input.priceCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "priceCents must be a non-negative integer");
  }
  if (input.currency === undefined || input.currency === null || (typeof input.currency === "string" && input.currency.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "currency is required");
  }
  return ok(input);
}

export function validateSetAvailabilityInput(input: SetAvailabilityInput): Result<SetAvailabilityInput> {
  if (input.itemId === undefined || input.itemId === null || (typeof input.itemId === "string" && input.itemId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "itemId is required");
  }
  if (input.available === undefined || input.available === null) {
    return err(ErrorCode.INVALID_INPUT, "available is required");
  }
  return ok(input);
}

export interface CreateMenuItemInput {
  readonly name: string;
  readonly categoryId: string;
  readonly priceCents: number;
  readonly currency: string;
  readonly description?: string;
}

export interface SetAvailabilityInput {
  readonly itemId: string;
  readonly available: boolean;
}
