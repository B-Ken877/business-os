/**
 * Input validation helpers for the service-customer-management component.
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

export function validateSetPreferencesInput(input: SetPreferencesInput): Result<SetPreferencesInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.preferencesJson === undefined || input.preferencesJson === null || (typeof input.preferencesJson === "string" && input.preferencesJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "preferencesJson is required");
  }
  return ok(input);
}

export interface CreateCustomerInput {
  readonly name: string;
  readonly phone?: string;
  readonly email?: string;
  readonly address?: string;
}

export interface SetPreferencesInput {
  readonly customerId: string;
  readonly preferencesJson: string;
}
