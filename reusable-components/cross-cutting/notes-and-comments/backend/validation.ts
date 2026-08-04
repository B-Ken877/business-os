/**
 * Input validation helpers for the notes-and-comments component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateCreateNoteInput(input: CreateNoteInput): Result<CreateNoteInput> {
  if (input.body === undefined || input.body === null || (typeof input.body === "string" && input.body.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "body is required");
  }
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.entityId === undefined || input.entityId === null || (typeof input.entityId === "string" && input.entityId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityId is required");
  }
  if (input.parentId !== undefined && input.parentId !== null) {
  }
  if (input.visibility === undefined || input.visibility === null) {
    return err(ErrorCode.INVALID_INPUT, "visibility is required");
  }
  if (!["internal", "visible_to_customer"].includes(input.visibility)) {
    return err(ErrorCode.INVALID_INPUT, `visibility must be one of: "internal", "visible_to_customer"`);
  }
  return ok(input);
}

export function validateListNotesForEntityInput(input: ListNotesForEntityInput): Result<ListNotesForEntityInput> {
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.entityId === undefined || input.entityId === null || (typeof input.entityId === "string" && input.entityId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityId is required");
  }
  return ok(input);
}

export function validateDeleteNoteInput(input: DeleteNoteInput): Result<DeleteNoteInput> {
  if (input.noteId === undefined || input.noteId === null || (typeof input.noteId === "string" && input.noteId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "noteId is required");
  }
  return ok(input);
}

export interface CreateNoteInput {
  readonly body: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly parentId?: string;
  readonly visibility: string;
}

export interface ListNotesForEntityInput {
  readonly entityType: string;
  readonly entityId: string;
}

export interface DeleteNoteInput {
  readonly noteId: string;
}
