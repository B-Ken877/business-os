/**
 * Input validation helpers for the school-parent-communication component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateSendParentMessageInput(input: SendParentMessageInput): Result<SendParentMessageInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  if (input.subject === undefined || input.subject === null || (typeof input.subject === "string" && input.subject.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "subject is required");
  }
  if (input.body === undefined || input.body === null || (typeof input.body === "string" && input.body.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "body is required");
  }
  return ok(input);
}

export function validateListMessagesForStudentInput(input: ListMessagesForStudentInput): Result<ListMessagesForStudentInput> {
  if (input.studentId === undefined || input.studentId === null || (typeof input.studentId === "string" && input.studentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "studentId is required");
  }
  return ok(input);
}

export interface SendParentMessageInput {
  readonly studentId: string;
  readonly subject: string;
  readonly body: string;
}

export interface ListMessagesForStudentInput {
  readonly studentId: string;
}
