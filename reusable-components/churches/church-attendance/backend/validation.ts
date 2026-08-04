/**
 * Input validation helpers for the church-attendance component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordAttendanceInput(input: RecordAttendanceInput): Result<RecordAttendanceInput> {
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  if (input.serviceDate === undefined || input.serviceDate === null) {
    return err(ErrorCode.INVALID_INPUT, "serviceDate is required");
  }
  if (typeof input.serviceDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.serviceDate)) {
    return err(ErrorCode.INVALID_INPUT, "serviceDate must be an ISO-8601 date");
  }
  if (input.attended === undefined || input.attended === null) {
    return err(ErrorCode.INVALID_INPUT, "attended is required");
  }
  return ok(input);
}

export function validateIsDecliningInput(input: IsDecliningInput): Result<IsDecliningInput> {
  if (input.memberId === undefined || input.memberId === null || (typeof input.memberId === "string" && input.memberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "memberId is required");
  }
  if (input.asOfDate === undefined || input.asOfDate === null) {
    return err(ErrorCode.INVALID_INPUT, "asOfDate is required");
  }
  if (typeof input.asOfDate !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.asOfDate)) {
    return err(ErrorCode.INVALID_INPUT, "asOfDate must be an ISO-8601 date");
  }
  return ok(input);
}

export interface RecordAttendanceInput {
  readonly memberId: string;
  readonly serviceDate: string;
  readonly attended: boolean;
}

export interface IsDecliningInput {
  readonly memberId: string;
  readonly asOfDate: string;
}
