/**
 * Input validation helpers for the school-grading component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordGradeInput(input: RecordGradeInput): Result<RecordGradeInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.assessmentId === undefined || input.assessmentId === null || (typeof input.assessmentId === "string" && input.assessmentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "assessmentId is required");
  }
  if (input.scorePct === undefined || input.scorePct === null) {
    return err(ErrorCode.INVALID_INPUT, "scorePct is required");
  }
  if (!Number.isInteger(input.scorePct) || input.scorePct < 0) {
    return err(ErrorCode.INVALID_INPUT, "scorePct must be a non-negative integer");
  }
  return ok(input);
}

export function validateComputeStudentAverageInput(input: ComputeStudentAverageInput): Result<ComputeStudentAverageInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  return ok(input);
}

export interface RecordGradeInput {
  readonly studentId: string;
  readonly assessmentId: string;
  readonly scorePct: number;
  readonly notes?: string;
}

export interface ComputeStudentAverageInput {
  readonly studentId: string;
}
