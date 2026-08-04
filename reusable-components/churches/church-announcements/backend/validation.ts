/**
 * Input validation helpers for the church-announcements component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validatePublishAnnouncementInput(input: PublishAnnouncementInput): Result<PublishAnnouncementInput> {
  if (input.title === undefined || input.title === null || (typeof input.title === "string" && input.title.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "title is required");
  }
  if (input.body === undefined || input.body === null || (typeof input.body === "string" && input.body.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "body is required");
  }
  if (input.audience === undefined || input.audience === null) {
    return err(ErrorCode.INVALID_INPUT, "audience is required");
  }
  if (!["public", "members", "staff"].includes(input.audience)) {
    return err(ErrorCode.INVALID_INPUT, `audience must be one of: "public", "members", "staff"`);
  }
  return ok(input);
}

export function validateListActiveAnnouncementsInput(input: ListActiveAnnouncementsInput): Result<ListActiveAnnouncementsInput> {
  if (input.audience === undefined || input.audience === null) {
    return err(ErrorCode.INVALID_INPUT, "audience is required");
  }
  if (!["public", "members", "staff"].includes(input.audience)) {
    return err(ErrorCode.INVALID_INPUT, `audience must be one of: "public", "members", "staff"`);
  }
  return ok(input);
}

export interface PublishAnnouncementInput {
  readonly title: string;
  readonly body: string;
  readonly audience: string;
}

export interface ListActiveAnnouncementsInput {
  readonly audience: string;
}
