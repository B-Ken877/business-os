/**
 * Input validation helpers for the clinic-reminders component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateScheduleReminderInput(input: ScheduleReminderInput): Result<ScheduleReminderInput> {
  if (input.patientId === undefined || input.patientId === null || (typeof input.patientId === "string" && input.patientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "patientId is required");
  }
  if (input.reminderType === undefined || input.reminderType === null) {
    return err(ErrorCode.INVALID_INPUT, "reminderType is required");
  }
  if (!["appointment", "medication", "follow_up"].includes(input.reminderType)) {
    return err(ErrorCode.INVALID_INPUT, `reminderType must be one of: "appointment", "medication", "follow_up"`);
  }
  if (input.scheduledFor === undefined || input.scheduledFor === null) {
    return err(ErrorCode.INVALID_INPUT, "scheduledFor is required");
  }
  if (typeof input.scheduledFor !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.scheduledFor)) {
    return err(ErrorCode.INVALID_INPUT, "scheduledFor must be an ISO-8601 date");
  }
  if (input.payloadJson === undefined || input.payloadJson === null || (typeof input.payloadJson === "string" && input.payloadJson.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "payloadJson is required");
  }
  return ok(input);
}

export function validateCancelReminderInput(input: CancelReminderInput): Result<CancelReminderInput> {
  if (input.reminderId === undefined || input.reminderId === null || (typeof input.reminderId === "string" && input.reminderId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "reminderId is required");
  }
  return ok(input);
}

export interface ScheduleReminderInput {
  readonly patientId: string;
  readonly reminderType: string;
  readonly scheduledFor: string;
  readonly payloadJson: string;
}

export interface CancelReminderInput {
  readonly reminderId: string;
}
