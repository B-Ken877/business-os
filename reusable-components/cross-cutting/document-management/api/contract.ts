/**
 * HTTP-shaped API contract for document-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Document } from "../backend/types";
import type { UploadDocumentInput, ListDocumentsForEntityInput, SoftDeleteDocumentInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/document-management/upload-document",
    permission: "documents.upload",
    description: "Register an uploaded file. The actual bytes are assumed to be already stored by the platform's storage adapter; this operation records the metadata.",
  },
  {
    method: "GET",
    path: "/v1/document-management/list-documents-for-entity",
    permission: "documents.read",
    description: "List all non-deleted documents attached to a specific entity.",
  },
  {
    method: "POST",
    path: "/v1/document-management/soft-delete-document",
    permission: "documents.delete",
    description: "Mark a document as soft-deleted. The bytes are retained until the retention window expires.",
  },
];
