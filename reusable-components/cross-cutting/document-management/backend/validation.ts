/**
 * Input validation helpers for the document-management component.
 *
 * Every operation that accepts untrusted input must run it through
 * these helpers BEFORE any business logic runs. See
 * ai-instructions/security-rules.md §4 (Input validation).
 */

import { type Result, ok, err, ErrorCode } from "@business-os/shared";

export function validateUploadDocumentInput(input: UploadDocumentInput): Result<UploadDocumentInput> {
  if (input.fileName === undefined || input.fileName === null || (typeof input.fileName === "string" && input.fileName.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "fileName is required");
  }
  if (input.mimeType === undefined || input.mimeType === null || (typeof input.mimeType === "string" && input.mimeType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "mimeType is required");
  }
  if (input.sizeBytes === undefined || input.sizeBytes === null) {
    return err(ErrorCode.INVALID_INPUT, "sizeBytes is required");
  }
  if (!Number.isInteger(input.sizeBytes) || input.sizeBytes <= 0) {
    return err(ErrorCode.INVALID_INPUT, "sizeBytes must be a positive integer");
  }
  if (input.storageKey === undefined || input.storageKey === null || (typeof input.storageKey === "string" && input.storageKey.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "storageKey is required");
  }
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.entityId === undefined || input.entityId === null || (typeof input.entityId === "string" && input.entityId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityId is required");
  }
  if (input.kind === undefined || input.kind === null || (typeof input.kind === "string" && input.kind.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "kind is required");
  }
  return ok(input);
}

export function validateListDocumentsForEntityInput(input: ListDocumentsForEntityInput): Result<ListDocumentsForEntityInput> {
  if (input.entityType === undefined || input.entityType === null || (typeof input.entityType === "string" && input.entityType.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityType is required");
  }
  if (input.entityId === undefined || input.entityId === null || (typeof input.entityId === "string" && input.entityId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "entityId is required");
  }
  return ok(input);
}

export function validateSoftDeleteDocumentInput(input: SoftDeleteDocumentInput): Result<SoftDeleteDocumentInput> {
  if (input.documentId === undefined || input.documentId === null || (typeof input.documentId === "string" && input.documentId.trim() === "")) {
    return err(ErrorCode.INVALID_INPUT, "documentId is required");
  }
  return ok(input);
}

export interface UploadDocumentInput {
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly storageKey: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly kind: string;
}

export interface ListDocumentsForEntityInput {
  readonly entityType: string;
  readonly entityId: string;
}

export interface SoftDeleteDocumentInput {
  readonly documentId: string;
}
