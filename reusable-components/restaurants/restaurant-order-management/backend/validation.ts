/**
 * Input validation helpers for the restaurant-order-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateOrderInput(input: CreateOrderInput): Result<CreateOrderInput> {
  if (input.itemsJson === undefined || input.itemsJson === null || (typeof input.itemsJson === "string" && input.itemsJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "itemsJson is required");
  }
  if (input.fulfillmentType === undefined || input.fulfillmentType === null) {
    return err(ErrorCode.INVALID_INPUT, "fulfillmentType is required");
  }
  if (!["dine_in", "takeout", "delivery"].includes(input.fulfillmentType)) {
    return err(ErrorCode.INVALID_INPUT, `fulfillmentType must be one of: "dine_in", "takeout", "delivery"`);
  }
  if (input.tableId !== undefined && input.tableId !== null) {
  }
  return ok(input);
}

export function validateAdvanceOrderStatusInput(input: AdvanceOrderStatusInput): Result<AdvanceOrderStatusInput> {
  if (input.orderId === undefined || input.orderId === null || (typeof input.orderId === "string" && input.orderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "orderId is required");
  }
  return ok(input);
}

export function validateCancelOrderInput(input: CancelOrderInput): Result<CancelOrderInput> {
  if (input.orderId === undefined || input.orderId === null || (typeof input.orderId === "string" && input.orderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "orderId is required");
  }
  return ok(input);
}

export interface CreateOrderInput {
  readonly itemsJson: string;
  readonly fulfillmentType: string;
  readonly tableId?: string;
  readonly deliveryAddress?: string;
  readonly specialInstructions?: string;
}

export interface AdvanceOrderStatusInput {
  readonly orderId: string;
}

export interface CancelOrderInput {
  readonly orderId: string;
}
