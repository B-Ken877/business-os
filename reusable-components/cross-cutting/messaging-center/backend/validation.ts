/**
 * Input validation helpers for the messaging-center component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateSendMessageInput(input: SendMessageInput): Result<SendMessageInput> {
  if (input.recipientId === undefined || input.recipientId === null || (typeof input.recipientId === "string" && input.recipientId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "recipientId is required");
  }
  if (input.channel === undefined || input.channel === null) {
    return err(ErrorCode.INVALID_INPUT, "channel is required");
  }
  if (!["in_app", "sms", "email", "whatsapp"].includes(input.channel)) {
    return err(ErrorCode.INVALID_INPUT, `channel must be one of: "in_app", "sms", "email", "whatsapp"`);
  }
  if (input.templateKey === undefined || input.templateKey === null || (typeof input.templateKey === "string" && input.templateKey.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "templateKey is required");
  }
  if (input.body === undefined || input.body === null || (typeof input.body === "string" && input.body.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "body is required");
  }
  return ok(input);
}

export function validateMarkDeliveredInput(input: MarkDeliveredInput): Result<MarkDeliveredInput> {
  if (input.messageId === undefined || input.messageId === null || (typeof input.messageId === "string" && input.messageId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "messageId is required");
  }
  return ok(input);
}

export interface SendMessageInput {
  readonly recipientId: string;
  readonly channel: string;
  readonly templateKey: string;
  readonly body: string;
}

export interface MarkDeliveredInput {
  readonly messageId: string;
}
