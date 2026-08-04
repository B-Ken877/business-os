/**
 * Domain types for the activity-timeline component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// TimelineEvent
//////////////////////////////////////////////////////////////////////
/** An immutable event in an entity's operational timeline. */
export interface TimelineEvent {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The kind of entity this event belongs to. */
  readonly entityType: string;
  /** The id of the entity. */
  readonly entityId: string;
  /** What happened (e.g. 'payment.recorded'). */
  readonly action: string;
  /** Human-readable summary of the event. */
  readonly summary: string;
  /** Who triggered the event. */
  readonly actorUserId: string;
  /** ISO-8601 timestamp the event occurred (may differ from recordedAt). */
  readonly occurredAt: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
