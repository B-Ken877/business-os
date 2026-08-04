/**
 * Input validation helpers for the restaurant-ingredient-tracking component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateAddIngredientStockInput(input: AddIngredientStockInput): Result<AddIngredientStockInput> {
  if (input.ingredientId === undefined || input.ingredientId === null || (typeof input.ingredientId === "string" && input.ingredientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "ingredientId is required");
  }
  if (input.quantityAdded === undefined || input.quantityAdded === null) {
    return err(ErrorCode.INVALID_INPUT, "quantityAdded is required");
  }
  if (!Number.isInteger(input.quantityAdded) || input.quantityAdded <= 0) {
    return err(ErrorCode.INVALID_INPUT, "quantityAdded must be a positive integer");
  }
  return ok(input);
}

export function validateDepleteForMenuItemInput(input: DepleteForMenuItemInput): Result<DepleteForMenuItemInput> {
  if (input.menuItemIngredientKey === undefined || input.menuItemIngredientKey === null || (typeof input.menuItemIngredientKey === "string" && input.menuItemIngredientKey.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "menuItemIngredientKey is required");
  }
  if (input.quantitySold === undefined || input.quantitySold === null) {
    return err(ErrorCode.INVALID_INPUT, "quantitySold is required");
  }
  if (!Number.isInteger(input.quantitySold) || input.quantitySold <= 0) {
    return err(ErrorCode.INVALID_INPUT, "quantitySold must be a positive integer");
  }
  return ok(input);
}

export interface AddIngredientStockInput {
  readonly ingredientId: string;
  readonly quantityAdded: number;
}

export interface DepleteForMenuItemInput {
  readonly menuItemIngredientKey: string;
  readonly quantitySold: number;
}
