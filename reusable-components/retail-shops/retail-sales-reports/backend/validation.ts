/**
 * Input validation helpers for the retail-sales-reports component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateComputeDailySummaryInput(input: ComputeDailySummaryInput): Result<ComputeDailySummaryInput> {
  if (input.date === undefined || input.date === null) {
    return err(ErrorCode.INVALID_INPUT, "date is required");
  }
  if (typeof input.date !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.date)) {
    return err(ErrorCode.INVALID_INPUT, "date must be an ISO-8601 date");
  }
  return ok(input);
}

export interface ComputeDailySummaryInput {
  readonly date: string;
}
