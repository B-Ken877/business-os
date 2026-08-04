/**
 * Input validation helpers for the retail-customer-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateCustomerInput(input: CreateCustomerInput): Result<CreateCustomerInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  return ok(input);
}

export function validateUpdateStatusInput(input: UpdateStatusInput): Result<UpdateStatusInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.newStatus === undefined || input.newStatus === null) {
    return err(ErrorCode.INVALID_INPUT, "newStatus is required");
  }
  if (!["active", "vip", "blacklisted"].includes(input.newStatus)) {
    return err(ErrorCode.INVALID_INPUT, `newStatus must be one of: "active", "vip", "blacklisted"`);
  }
  return ok(input);
}

export function validateAddLoyaltyNoteInput(input: AddLoyaltyNoteInput): Result<AddLoyaltyNoteInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.note === undefined || input.note === null || (typeof input.note === "string" && input.note.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "note is required");
  }
  return ok(input);
}

export interface CreateCustomerInput {
  readonly name: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
}

export interface UpdateStatusInput {
  readonly customerId: string;
  readonly newStatus: string;
}

export interface AddLoyaltyNoteInput {
  readonly customerId: string;
  readonly note: string;
}
