/**
 * Domain types for the church-groups component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Group
//////////////////////////////////////////////////////////////////////
/** A small group or ministry team. */
export interface Group {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Group name. */
  readonly name: string;
  /** Longer description. */
  readonly description: string | null;
  /** Group leader (member id). */
  readonly leaderMemberId: string;
  /** Maximum members (0 = unlimited). */
  readonly maxMembers: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// GroupMembership
//////////////////////////////////////////////////////////////////////
/** A member's participation in a group. */
export interface GroupMembership {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The group. */
  readonly groupId: string;
  /** The member. */
  readonly memberId: string;
  /** Role in the group. */
  readonly role: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
