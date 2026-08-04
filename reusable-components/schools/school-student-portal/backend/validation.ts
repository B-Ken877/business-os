/**
 * Input validation helpers for the school-student-portal component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateStartSessionInput(input: StartSessionInput): Result<StartSessionInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  return ok(input);
}

export function validateEndSessionInput(input: EndSessionInput): Result<EndSessionInput> {
  if (input.sessionId === undefined || input.sessionId === null || (typeof input.sessionId === "string" && input.sessionId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "sessionId is required");
  }
  return ok(input);
}

export interface StartSessionInput {
  readonly studentId: string;
}

export interface EndSessionInput {
  readonly sessionId: string;
}
