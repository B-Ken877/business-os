/**
 * Input validation helpers for the service-job-tracking component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateJobInput(input: CreateJobInput): Result<CreateJobInput> {
  if (input.customerId === undefined || input.customerId === null || (typeof input.customerId === "string" && input.customerId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "customerId is required");
  }
  if (input.title === undefined || input.title === null || (typeof input.title === "string" && input.title.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "title is required");
  }
  if (input.bookingId !== undefined && input.bookingId !== null) {
  }
  return ok(input);
}

export function validateAddTaskInput(input: AddTaskInput): Result<AddTaskInput> {
  if (input.jobId === undefined || input.jobId === null || (typeof input.jobId === "string" && input.jobId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "jobId is required");
  }
  if (input.title === undefined || input.title === null || (typeof input.title === "string" && input.title.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "title is required");
  }
  if (input.order === undefined || input.order === null) {
    return err(ErrorCode.INVALID_INPUT, "order is required");
  }
  if (!Number.isInteger(input.order) || input.order <= 0) {
    return err(ErrorCode.INVALID_INPUT, "order must be a positive integer");
  }
  return ok(input);
}

export function validateCompleteTaskInput(input: CompleteTaskInput): Result<CompleteTaskInput> {
  if (input.taskId === undefined || input.taskId === null || (typeof input.taskId === "string" && input.taskId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "taskId is required");
  }
  return ok(input);
}

export interface CreateJobInput {
  readonly customerId: string;
  readonly title: string;
  readonly bookingId?: string;
}

export interface AddTaskInput {
  readonly jobId: string;
  readonly title: string;
  readonly order: number;
}

export interface CompleteTaskInput {
  readonly taskId: string;
}
