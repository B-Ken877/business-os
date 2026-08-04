/**
 * Domain types for the church-sermons component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Sermon
//////////////////////////////////////////////////////////////////////
/** A sermon record. */
export interface Sermon {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Sermon title. */
  readonly title: string;
  /** Member who spoke (or guest name). */
  readonly speakerMemberId: string;
  /** ISO-8601 date the sermon was delivered. */
  readonly deliveredAt: string;
  /** Free-form scripture references (e.g. 'John 3:16'). */
  readonly scriptureReferences: string | null;
  /** Series this sermon belongs to, or null. */
  readonly seriesId: string | null;
  /** Document id of the audio recording. */
  readonly audioDocumentId: string | null;
  /** Document id of the video recording. */
  readonly videoDocumentId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
