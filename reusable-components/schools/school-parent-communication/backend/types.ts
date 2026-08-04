/**
 * Domain types for the school-parent-communication component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// ParentMessage
//////////////////////////////////////////////////////////////////////
/** A message to or from a parent. */
export interface ParentMessage {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Student whose parent is the recipient. */
  readonly studentId: string;
  /** Message subject. */
  readonly subject: string;
  /** Message body. */
  readonly body: string;
  /** Message direction. */
  readonly direction: string;
  /** Reference to the message in messaging-center. */
  readonly messagingMessageId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
