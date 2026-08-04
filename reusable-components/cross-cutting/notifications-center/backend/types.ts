/**
 * Domain types for the notifications-center component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Notification
//////////////////////////////////////////////////////////////////////
/** A single notification in a user's inbox. */
export interface Notification {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The user this notification is for. */
  readonly recipientUserId: string;
  /** Short title shown in the inbox. */
  readonly title: string;
  /** Longer body text. */
  readonly body: string;
  /** Label for the call-to-action button. */
  readonly actionLabel: string | null;
  /** URL the action button navigates to. */
  readonly actionUrl: string | null;
  /** ISO-8601 timestamp the user marked the notification read, or null. */
  readonly readAt: string | null;
  /** ISO-8601 timestamp the user dismissed the notification, or null. */
  readonly dismissedAt: string | null;
  /** ISO-8601 timestamp after which the notification is no longer shown. */
  readonly expiresAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
