/**
 * Domain types for the document-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Document
//////////////////////////////////////////////////////////////////////
/** A file uploaded and attached to a business entity. */
export interface Document {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Original file name as uploaded. */
  readonly fileName: string;
  /** MIME type, validated against the allow-list. */
  readonly mimeType: string;
  /** File size in bytes. */
  readonly sizeBytes: number;
  /** Opaque key the platform's storage adapter uses to fetch bytes. */
  readonly storageKey: string;
  /** The kind of entity this document is attached to (e.g. 'invoice', 'patient'). */
  readonly entityType: string;
  /** The id of the attached entity. */
  readonly entityId: string;
  /** Document kind within the entity (e.g. 'prescription', 'report_card'). */
  readonly kind: string;
  /** ISO-8601 timestamp of soft-delete, or null. */
  readonly deletedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
