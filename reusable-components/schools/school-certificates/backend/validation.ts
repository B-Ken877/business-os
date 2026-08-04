/**
 * Input validation helpers for the school-certificates component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateIssueCertificateInput(input: IssueCertificateInput): Result<IssueCertificateInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.programName === undefined || input.programName === null || (typeof input.programName === "string" && input.programName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "programName is required");
  }
  if (input.certificateNumber === undefined || input.certificateNumber === null || (typeof input.certificateNumber === "string" && input.certificateNumber.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "certificateNumber is required");
  }
  return ok(input);
}

export function validateRevokeCertificateInput(input: RevokeCertificateInput): Result<RevokeCertificateInput> {
  if (input.certificateId === undefined || input.certificateId === null || (typeof input.certificateId === "string" && input.certificateId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "certificateId is required");
  }
  return ok(input);
}

export interface IssueCertificateInput {
  readonly studentId: string;
  readonly programName: string;
  readonly certificateNumber: string;
}

export interface RevokeCertificateInput {
  readonly certificateId: string;
}
