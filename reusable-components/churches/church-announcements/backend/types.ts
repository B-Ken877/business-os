/**
 * Domain types for the church-announcements component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Announcement
//////////////////////////////////////////////////////////////////////
/** A church announcement. */
export interface Announcement {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Announcement title. */
  readonly title: string;
  /** Announcement body. */
  readonly body: string;
  /** Target audience. */
  readonly audience: string;
  /** ISO-8601 expiry timestamp. */
  readonly expiresAt: string;
  /** Announcement status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
