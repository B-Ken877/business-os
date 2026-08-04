/**
 * Input validation helpers for the notifications-center component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validatePushNotificationInput(input: PushNotificationInput): Result<PushNotificationInput> {
  if (input.recipientUserId === undefined || input.recipientUserId === null || (typeof input.recipientUserId === "string" && input.recipientUserId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "recipientUserId is required");
  }
  if (input.title === undefined || input.title === null || (typeof input.title === "string" && input.title.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "title is required");
  }
  if (input.body === undefined || input.body === null || (typeof input.body === "string" && input.body.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "body is required");
  }
  return ok(input);
}

export function validateMarkReadInput(input: MarkReadInput): Result<MarkReadInput> {
  if (input.notificationId === undefined || input.notificationId === null || (typeof input.notificationId === "string" && input.notificationId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "notificationId is required");
  }
  return ok(input);
}

export interface PushNotificationInput {
  readonly recipientUserId: string;
  readonly title: string;
  readonly body: string;
  readonly actionLabel?: string;
  readonly actionUrl?: string;
}

export interface MarkReadInput {
  readonly notificationId: string;
}
