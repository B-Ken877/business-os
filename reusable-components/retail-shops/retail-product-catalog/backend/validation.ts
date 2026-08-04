/**
 * Input validation helpers for the retail-product-catalog component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateProductInput(input: CreateProductInput): Result<CreateProductInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.sku === undefined || input.sku === null || (typeof input.sku === "string" && input.sku.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "sku is required");
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

export function validateUpdatePriceInput(input: UpdatePriceInput): Result<UpdatePriceInput> {
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  if (input.newPriceCents === undefined || input.newPriceCents === null) {
    return err(ErrorCode.INVALID_INPUT, "newPriceCents is required");
  }
  if (!Number.isInteger(input.newPriceCents) || input.newPriceCents < 0) {
    return err(ErrorCode.INVALID_INPUT, "newPriceCents must be a non-negative integer");
  }
  return ok(input);
}

export function validateArchiveProductInput(input: ArchiveProductInput): Result<ArchiveProductInput> {
  if (input.productId === undefined || input.productId === null || (typeof input.productId === "string" && input.productId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "productId is required");
  }
  return ok(input);
}

export interface CreateProductInput {
  readonly name: string;
  readonly sku: string;
  readonly categoryId: string;
  readonly priceCents: number;
  readonly currency: string;
  readonly description?: string;
}

export interface UpdatePriceInput {
  readonly productId: string;
  readonly newPriceCents: number;
}

export interface ArchiveProductInput {
  readonly productId: string;
}
