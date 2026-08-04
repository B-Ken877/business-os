/**
 * Input validation helpers for the school-class-scheduling component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateScheduleSessionInput(input: ScheduleSessionInput): Result<ScheduleSessionInput> {
  if (input.subject === undefined || input.subject === null || (typeof input.subject === "string" && input.subject.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "subject is required");
  }
  if (input.teacherUserId === undefined || input.teacherUserId === null || (typeof input.teacherUserId === "string" && input.teacherUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "teacherUserId is required");
  }
  if (input.roomId === undefined || input.roomId === null || (typeof input.roomId === "string" && input.roomId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "roomId is required");
  }
  if (input.dayOfWeek === undefined || input.dayOfWeek === null) {
    return err(ErrorCode.INVALID_INPUT, "dayOfWeek is required");
  }
  if (!Number.isInteger(input.dayOfWeek) || input.dayOfWeek <= 0) {
    return err(ErrorCode.INVALID_INPUT, "dayOfWeek must be a positive integer");
  }
  if (input.startHour === undefined || input.startHour === null) {
    return err(ErrorCode.INVALID_INPUT, "startHour is required");
  }
  if (!Number.isInteger(input.startHour) || input.startHour < 0) {
    return err(ErrorCode.INVALID_INPUT, "startHour must be a non-negative integer");
  }
  if (input.startMinute === undefined || input.startMinute === null) {
    return err(ErrorCode.INVALID_INPUT, "startMinute is required");
  }
  if (!Number.isInteger(input.startMinute) || input.startMinute < 0) {
    return err(ErrorCode.INVALID_INPUT, "startMinute must be a non-negative integer");
  }
  return ok(input);
}

export function validateListSessionsForTeacherInput(input: ListSessionsForTeacherInput): Result<ListSessionsForTeacherInput> {
  if (input.teacherUserId === undefined || input.teacherUserId === null || (typeof input.teacherUserId === "string" && input.teacherUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "teacherUserId is required");
  }
  return ok(input);
}

export interface ScheduleSessionInput {
  readonly subject: string;
  readonly teacherUserId: string;
  readonly roomId: string;
  readonly dayOfWeek: number;
  readonly startHour: number;
  readonly startMinute: number;
}

export interface ListSessionsForTeacherInput {
  readonly teacherUserId: string;
}
