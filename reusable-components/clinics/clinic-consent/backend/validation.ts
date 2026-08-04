/**
 * Input validation helpers for the clinic-consent component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateGrantConsentInput(input: GrantConsentInput): Result<GrantConsentInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.purpose === undefined || input.purpose === null || (typeof input.purpose === "string" && input.purpose.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "purpose is required");
  }
  return ok(input);
}

export function validateRevokeConsentInput(input: RevokeConsentInput): Result<RevokeConsentInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.purpose === undefined || input.purpose === null || (typeof input.purpose === "string" && input.purpose.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "purpose is required");
  }
  return ok(input);
}

export function validateHasActiveConsentInput(input: HasActiveConsentInput): Result<HasActiveConsentInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.purpose === undefined || input.purpose === null || (typeof input.purpose === "string" && input.purpose.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "purpose is required");
  }
  return ok(input);
}

export interface GrantConsentInput {
  readonly patientId: string;
  readonly purpose: string;
}

export interface RevokeConsentInput {
  readonly patientId: string;
  readonly purpose: string;
  readonly reason?: string;
}

export interface HasActiveConsentInput {
  readonly patientId: string;
  readonly purpose: string;
}
