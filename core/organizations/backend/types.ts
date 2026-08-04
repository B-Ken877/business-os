/**
 * Domain types for the organizations module.
 *
 * An Organization is the platform's representation of a business — what
 * the constitution calls a "tenant". Every record on the platform belongs
 * to exactly one organization, and that ownership is enforced at every
 * layer.
 */

import type { EntityId, TenantId } from "@business-os/shared";

/**
 * An Organization. Also referred to as a "tenant" in the platform's
 * documentation and in the TenantContext type.
 */
export interface Organization {
  readonly id: TenantId;
  /** Display name (e.g. "Resto Lakou"). */
  readonly name: string;
  /** Slug used in URLs (e.g. "resto-lakou"). Unique platform-wide. */
  readonly slug: string;
  /** Industry vertical, used to suggest a template. */
  readonly industry: string;
  readonly status: OrganizationStatus;
  /** ISO-8601 timestamp. */
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type OrganizationStatus = "active" | "suspended" | "deleted";

/**
 * A user's membership in an organization. A user may belong to multiple
 * organizations; each membership has its own role assignment.
 */
export interface Membership {
  readonly id: EntityId;
  readonly organizationId: TenantId;
  readonly userId: EntityId;
  /** The role this user holds in this organization (e.g. "owner", "member"). */
  readonly role: string;
  readonly status: MembershipStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type MembershipStatus = "active" | "invited" | "revoked";

/**
 * An invitation for a user to join an organization. Sent by email;
 * the user accepts to activate their membership.
 */
export interface Invitation {
  readonly id: EntityId;
  readonly organizationId: TenantId;
  readonly email: string;
  readonly role: string;
  /** Single-use, time-limited token. */
  readonly token: string;
  readonly status: InvitationStatus;
  readonly expiresAt: string;
  readonly invitedByUserId: EntityId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type InvitationStatus = "pending" | "accepted" | "revoked" | "expired";
