/**
 * Input validation helpers for the activity-timeline component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRecordEventInput(input: RecordEventInput): Result<RecordEventInput> {
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.entityId === undefined || input.entityId === null || (typeof input.entityId === "string" && input.entityId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityId is required");
  }
  if (input.action === undefined || input.action === null || (typeof input.action === "string" && input.action.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "action is required");
  }
  if (input.summary === undefined || input.summary === null || (typeof input.summary === "string" && input.summary.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "summary is required");
  }
  if (input.occurredAt === undefined || input.occurredAt === null) {
    return err(ErrorCode.INVALID_INPUT, "occurredAt is required");
  }
  if (typeof input.occurredAt !== "string" || !/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(input.occurredAt)) {
    return err(ErrorCode.INVALID_INPUT, "occurredAt must be an ISO-8601 date");
  }
  return ok(input);
}

export function validateListEventsForEntityInput(input: ListEventsForEntityInput): Result<ListEventsForEntityInput> {
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.entityId === undefined || input.entityId === null || (typeof input.entityId === "string" && input.entityId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityId is required");
  }
  return ok(input);
}

export interface RecordEventInput {
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly summary: string;
  readonly occurredAt: string;
}

export interface ListEventsForEntityInput {
  readonly entityType: string;
  readonly entityId: string;
}
