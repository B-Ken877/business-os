/**
 * Input validation helpers for the church-sermons component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordSermonInput(input: RecordSermonInput): Result<RecordSermonInput> {
  if (input.title === undefined || input.title === null || (typeof input.title === "string" && input.title.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "title is required");
  }
  if (input.speakerMemberId === undefined || input.speakerMemberId === null || (typeof input.speakerMemberId === "string" && input.speakerMemberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "speakerMemberId is required");
  }
  if (input.deliveredAt === undefined || input.deliveredAt === null) {
    return err(ErrorCode.INVALID_INPUT, "deliveredAt is required");
  }
  if (typeof input.deliveredAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.deliveredAt)) {
    return err(ErrorCode.INVALID_INPUT, "deliveredAt must be an ISO-8601 date");
  }
  if (input.seriesId !== undefined && input.seriesId !== null) {
  }
  return ok(input);
}

export function validateListSermonsBySpeakerInput(input: ListSermonsBySpeakerInput): Result<ListSermonsBySpeakerInput> {
  if (input.speakerMemberId === undefined || input.speakerMemberId === null || (typeof input.speakerMemberId === "string" && input.speakerMemberId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "speakerMemberId is required");
  }
  return ok(input);
}

export interface RecordSermonInput {
  readonly title: string;
  readonly speakerMemberId: string;
  readonly deliveredAt: string;
  readonly scriptureReferences?: string;
  readonly seriesId?: string;
}

export interface ListSermonsBySpeakerInput {
  readonly speakerMemberId: string;
}
