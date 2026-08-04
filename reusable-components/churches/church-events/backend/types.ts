/**
 * Domain types for the church-events component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Event
//////////////////////////////////////////////////////////////////////
/** A church event. */
export interface Event {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Event name. */
  readonly name: string;
  /** Longer description. */
  readonly description: string | null;
  /** ISO-8601 start. */
  readonly startsAt: string;
  /** ISO-8601 end. */
  readonly endsAt: string;
  /** Physical location. */
  readonly location: string | null;
  /** Maximum attendees (0 = unlimited). */
  readonly capacity: number;
  /** Event status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// EventRegistration
//////////////////////////////////////////////////////////////////////
/** An event registration. */
export interface EventRegistration {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The event registered for. */
  readonly eventId: string;
  /** Member who registered. */
  readonly memberId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
