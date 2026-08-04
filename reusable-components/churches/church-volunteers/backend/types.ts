/**
 * Domain types for the church-volunteers component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Volunteer
//////////////////////////////////////////////////////////////////////
/** A church volunteer. */
export interface Volunteer {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The member who is volunteering. */
  readonly memberId: string;
  /** Volunteer role (e.g. 'usher', 'worship_team'). */
  readonly role: string;
  /** Volunteer status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// VolunteerAssignment
//////////////////////////////////////////////////////////////////////
/** A volunteer's assignment to an event or ministry. */
export interface VolunteerAssignment {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The volunteer. */
  readonly volunteerId: string;
  /** What they're assigned to (e.g. 'event', 'ministry'). */
  readonly assignmentType: string;
  /** Id of the event or ministry. */
  readonly assignmentId: string;
  /** Assignment status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
