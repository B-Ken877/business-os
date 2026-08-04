/**
 * Input validation helpers for the school-attendance component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordAttendanceInput(input: RecordAttendanceInput): Result<RecordAttendanceInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.sessionDate === undefined || input.sessionDate === null) {
    return err(ErrorCode.INVALID_INPUT, "sessionDate is required");
  }
  if (typeof input.sessionDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.sessionDate)) {
    return err(ErrorCode.INVALID_INPUT, "sessionDate must be an ISO-8601 date");
  }
  if (input.status === undefined || input.status === null) {
    return err(ErrorCode.INVALID_INPUT, "status is required");
  }
  if (!["present", "absent", "late", "excused"].includes(input.status)) {
    return err(ErrorCode.INVALID_INPUT, `status must be one of: "present", "absent", "late", "excused"`);
  }
  return ok(input);
}

export function validateComputeAttendanceRateInput(input: ComputeAttendanceRateInput): Result<ComputeAttendanceRateInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.fromDate === undefined || input.fromDate === null) {
    return err(ErrorCode.INVALID_INPUT, "fromDate is required");
  }
  if (typeof input.fromDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.fromDate)) {
    return err(ErrorCode.INVALID_INPUT, "fromDate must be an ISO-8601 date");
  }
  if (input.toDate === undefined || input.toDate === null) {
    return err(ErrorCode.INVALID_INPUT, "toDate is required");
  }
  if (typeof input.toDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.toDate)) {
    return err(ErrorCode.INVALID_INPUT, "toDate must be an ISO-8601 date");
  }
  return ok(input);
}

export interface RecordAttendanceInput {
  readonly studentId: string;
  readonly sessionDate: string;
  readonly status: string;
  readonly notes?: string;
}

export interface ComputeAttendanceRateInput {
  readonly studentId: string;
  readonly fromDate: string;
  readonly toDate: string;
}
