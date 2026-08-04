/**
 * Domain types for the notes-and-comments component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Note
//////////////////////////////////////////////////////////////////////
/** A note or comment attached to an entity. */
export interface Note {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The note text. */
  readonly body: string;
  /** The kind of entity this note is attached to. */
  readonly entityType: string;
  /** The id of the attached entity. */
  readonly entityId: string;
  /** Parent note id for threaded replies, or null. */
  readonly parentId: string | null;
  /** Who can see the note. */
  readonly visibility: string;
  /** ISO-8601 timestamp of the last edit, or null. */
  readonly editedAt: string | null;
  /** ISO-8601 timestamp of soft-delete, or null. */
  readonly deletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
