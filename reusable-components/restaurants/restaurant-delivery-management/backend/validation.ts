/**
 * Input validation helpers for the restaurant-delivery-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateAssignDriverInput(input: AssignDriverInput): Result<AssignDriverInput> {
  if (input.deliveryId === undefined || input.deliveryId === null || (typeof input.deliveryId === "string" && input.deliveryId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "deliveryId is required");
  }
  if (input.driverId === undefined || input.driverId === null || (typeof input.driverId === "string" && input.driverId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "driverId is required");
  }
  return ok(input);
}

export function validateConfirmDeliveredInput(input: ConfirmDeliveredInput): Result<ConfirmDeliveredInput> {
  if (input.deliveryId === undefined || input.deliveryId === null || (typeof input.deliveryId === "string" && input.deliveryId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "deliveryId is required");
  }
  return ok(input);
}

export interface AssignDriverInput {
  readonly deliveryId: string;
  readonly driverId: string;
}

export interface ConfirmDeliveredInput {
  readonly deliveryId: string;
}
