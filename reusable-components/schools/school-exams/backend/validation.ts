/**
 * Input validation helpers for the school-exams component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateExamInput(input: CreateExamInput): Result<CreateExamInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.period === undefined || input.period === null || (typeof input.period === "string" && input.period.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "period is required");
  }
  if (input.startsAt === undefined || input.startsAt === null) {
    return err(ErrorCode.INVALID_INPUT, "startsAt is required");
  }
  if (typeof input.startsAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.startsAt)) {
    return err(ErrorCode.INVALID_INPUT, "startsAt must be an ISO-8601 date");
  }
  if (input.endsAt === undefined || input.endsAt === null) {
    return err(ErrorCode.INVALID_INPUT, "endsAt is required");
  }
  if (typeof input.endsAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.endsAt)) {
    return err(ErrorCode.INVALID_INPUT, "endsAt must be an ISO-8601 date");
  }
  return ok(input);
}

export function validateMarkExamGradedInput(input: MarkExamGradedInput): Result<MarkExamGradedInput> {
  if (input.examId === undefined || input.examId === null || (typeof input.examId === "string" && input.examId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "examId is required");
  }
  return ok(input);
}

export interface CreateExamInput {
  readonly name: string;
  readonly period: string;
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface MarkExamGradedInput {
  readonly examId: string;
}
