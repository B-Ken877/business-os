/**
 * Input validation helpers for the clinic-triage component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordTriageInput(input: RecordTriageInput): Result<RecordTriageInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.visitReason === undefined || input.visitReason === null || (typeof input.visitReason === "string" && input.visitReason.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "visitReason is required");
  }
  if (input.urgency === undefined || input.urgency === null) {
    return err(ErrorCode.INVALID_INPUT, "urgency is required");
  }
  if (!["low", "medium", "high", "emergency"].includes(input.urgency)) {
    return err(ErrorCode.INVALID_INPUT, `urgency must be one of: "low", "medium", "high", "emergency"`);
  }
  return ok(input);
}

export interface RecordTriageInput {
  readonly patientId: string;
  readonly visitReason: string;
  readonly symptomsJson?: string;
  readonly urgency: string;
}
