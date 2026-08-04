/**
 * Input validation helpers for the restaurant-table-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateTableInput(input: CreateTableInput): Result<CreateTableInput> {
  if (input.label === undefined || input.label === null || (typeof input.label === "string" && input.label.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "label is required");
  }
  if (input.seats === undefined || input.seats === null) {
    return err(ErrorCode.INVALID_INPUT, "seats is required");
  }
  if (!Number.isInteger(input.seats) || input.seats <= 0) {
    return err(ErrorCode.INVALID_INPUT, "seats must be a positive integer");
  }
  return ok(input);
}

export function validateAssignOrderToTableInput(input: AssignOrderToTableInput): Result<AssignOrderToTableInput> {
  if (input.tableId === undefined || input.tableId === null || (typeof input.tableId === "string" && input.tableId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "tableId is required");
  }
  if (input.orderId === undefined || input.orderId === null || (typeof input.orderId === "string" && input.orderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "orderId is required");
  }
  return ok(input);
}

export function validateReleaseTableInput(input: ReleaseTableInput): Result<ReleaseTableInput> {
  if (input.tableId === undefined || input.tableId === null || (typeof input.tableId === "string" && input.tableId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "tableId is required");
  }
  return ok(input);
}

export interface CreateTableInput {
  readonly label: string;
  readonly seats: number;
}

export interface AssignOrderToTableInput {
  readonly tableId: string;
  readonly orderId: string;
}

export interface ReleaseTableInput {
  readonly tableId: string;
}
