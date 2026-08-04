/**
 * Domain types for the messaging-center component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Message
//////////////////////////////////////////////////////////////////////
/** A single message addressed to a single recipient. */
export interface Message {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Identifier of the recipient (user id, phone, or email). */
  readonly recipientId: string;
  /** Delivery channel. */
  readonly channel: string;
  /** Template identifier; the message body is rendered from the template. */
  readonly templateKey: string;
  /** Variables substituted into the template. */
  readonly variables: Readonly<Record<string, string>> | null;
  /** Current delivery status. */
  readonly status: string;
  /** ISO-8601 timestamp the message was handed to the channel, or null. */
  readonly sentAt: string | null;
  /** ISO-8601 timestamp the channel confirmed delivery, or null. */
  readonly deliveredAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
