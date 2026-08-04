/**
 * HTTP-shaped API contract for notes-and-comments.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Note } from "../backend/types";
import type { CreateNoteInput, ListNotesForEntityInput, DeleteNoteInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/notes-and-comments/create-note",
    permission: "notes.create",
    description: "Create a new note attached to an entity.",
  },
  {
    method: "GET",
    path: "/v1/notes-and-comments/list-notes-for-entity",
    permission: "notes.read",
    description: "List all non-deleted notes attached to an entity.",
  },
  {
    method: "DELETE",
    path: "/v1/notes-and-comments/delete-note",
    permission: "notes.delete",
    description: "Soft-delete a note. Replies are not auto-deleted; they reference a deleted parent.",
  },
];
