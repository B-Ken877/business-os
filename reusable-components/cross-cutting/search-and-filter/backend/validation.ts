/**
 * Input validation helpers for the search-and-filter component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateRunQueryInput(input: RunQueryInput): Result<RunQueryInput> {
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.pageSize === undefined || input.pageSize === null) {
    return err(ErrorCode.INVALID_INPUT, "pageSize is required");
  }
  if (!Number.isInteger(input.pageSize) || input.pageSize <= 0) {
    return err(ErrorCode.INVALID_INPUT, "pageSize must be a positive integer");
  }
  if (input.sortDirection === undefined || input.sortDirection === null) {
    return err(ErrorCode.INVALID_INPUT, "sortDirection is required");
  }
  if (!["asc", "desc"].includes(input.sortDirection)) {
    return err(ErrorCode.INVALID_INPUT, `sortDirection must be one of: "asc", "desc"`);
  }
  return ok(input);
}

export function validateSaveQueryInput(input: SaveQueryInput): Result<SaveQueryInput> {
  if (input.name === undefined || input.name === null || (typeof input.name === "string" && input.name.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "name is required");
  }
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.sortDirection === undefined || input.sortDirection === null) {
    return err(ErrorCode.INVALID_INPUT, "sortDirection is required");
  }
  if (!["asc", "desc"].includes(input.sortDirection)) {
    return err(ErrorCode.INVALID_INPUT, `sortDirection must be one of: "asc", "desc"`);
  }
  return ok(input);
}

export interface RunQueryInput {
  readonly entityType: string;
  readonly queryText?: string;
  readonly pageSize: number;
  readonly cursor?: string;
  readonly sortField?: string;
  readonly sortDirection: string;
}

export interface SaveQueryInput {
  readonly name: string;
  readonly entityType: string;
  readonly queryText?: string;
  readonly sortField?: string;
  readonly sortDirection: string;
}
