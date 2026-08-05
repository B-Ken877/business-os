/**
 * Business logic for the organizations module.
 *
 * An Organization is the platform's "tenant". Every record belongs to
 * exactly one organization; ownership is enforced at every layer.
 *
 * This module knows about users (from core/identity) but does NOT enforce
 * permissions — that is the caller's responsibility. The HTTP layer will
 * check that the calling user is a member of the organization (with the
 * appropriate role) before invoking these operations.
 */

import { randomBytes } from "node:crypto";
import {
  type AuditSink,
  type Result,
  type EntityId,
  type TenantId,
  ok,
  err,
  asEntityId,
  asTenantId,
  asUserId,
  createAuditEntry,
  ErrorCode,
} from "@business-os/shared";
import type { Organization, Membership, Invitation } from "./types";
import type {
  CreateOrganizationInput,
  InviteMemberInput,
  AcceptInvitationInput,
  RevokeMembershipInput,
} from "./validation";
import {
  validateCreateOrganizationInput,
  validateInviteMemberInput,
  validateAcceptInvitationInput,
  validateRevokeMembershipInput,
} from "./validation";

// ---------------------------------------------------------------------------
// Persistence interface
// ---------------------------------------------------------------------------

export interface OrganizationsStore {
  // Organizations
  getOrganization(id: TenantId): Organization | undefined;
  getOrganizationBySlug(slug: string): Organization | undefined;
  putOrganization(org: Organization): void;
  listOrganizations(): readonly Organization[];

  // Memberships
  getMembership(id: EntityId): Membership | undefined;
  putMembership(membership: Membership): void;
  listMembershipsForOrganization(organizationId: TenantId): readonly Membership[];
  listMembershipsForUser(userId: EntityId): readonly Membership[];
  findMembership(organizationId: TenantId, userId: EntityId): Membership | undefined;

  // Invitations
  getInvitationByToken(token: string): Invitation | undefined;
  putInvitation(invitation: Invitation): void;
  listInvitationsForOrganization(organizationId: TenantId): readonly Invitation[];
}

export class InMemoryOrganizationsStore implements OrganizationsStore {
  private readonly orgs = new Map<string, Organization>();
  private readonly orgsBySlug = new Map<string, Organization>();
  private readonly memberships = new Map<string, Membership>();
  private readonly membershipsByOrg = new Map<string, Membership[]>();
  private readonly membershipsByUser = new Map<string, Membership[]>();
  private readonly invitationsByToken = new Map<string, Invitation>();
  private readonly invitationsByOrg = new Map<string, Invitation[]>();

  getOrganization(id: TenantId): Organization | undefined {
    return this.orgs.get(id);
  }
  getOrganizationBySlug(slug: string): Organization | undefined {
    return this.orgsBySlug.get(slug.toLowerCase());
  }
  putOrganization(org: Organization): void {
    this.orgs.set(org.id, org);
    this.orgsBySlug.set(org.slug.toLowerCase(), org);
  }
  listOrganizations(): readonly Organization[] {
    return [...this.orgs.values()];
  }

  getMembership(id: EntityId): Membership | undefined {
    return this.memberships.get(id);
  }
  putMembership(membership: Membership): void {
    this.memberships.set(membership.id, membership);
    push(this.membershipsByOrg, membership.organizationId, membership);
    push(this.membershipsByUser, membership.userId, membership);
  }
  listMembershipsForOrganization(organizationId: TenantId): readonly Membership[] {
    return [...(this.membershipsByOrg.get(organizationId) ?? [])];
  }
  listMembershipsForUser(userId: EntityId): readonly Membership[] {
    return [...(this.membershipsByUser.get(userId) ?? [])];
  }
  findMembership(organizationId: TenantId, userId: EntityId): Membership | undefined {
    return this.listMembershipsForOrganization(organizationId)
      .find((m) => m.userId === userId && m.status === "active");
  }

  getInvitationByToken(token: string): Invitation | undefined {
    return this.invitationsByToken.get(token);
  }
  putInvitation(invitation: Invitation): void {
    this.invitationsByToken.set(invitation.token, invitation);
    push(this.invitationsByOrg, invitation.organizationId, invitation);
  }
  listInvitationsForOrganization(organizationId: TenantId): readonly Invitation[] {
    return [...(this.invitationsByOrg.get(organizationId) ?? [])];
  }
}

function push<T>(map: Map<string, T[]>, key: string, value: T): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export interface OrganizationsConfig {
  readonly invitationExpiryHours: number;
  readonly maxMembersPerOrganization: number;
}

export const defaultOrganizationsConfig: OrganizationsConfig = {
  invitationExpiryHours: 24 * 7, // 7 days
  maxMembersPerOrganization: 100,
};

export interface Dependencies {
  readonly store: OrganizationsStore;
  readonly audit: AuditSink;
  readonly config: OrganizationsConfig;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * Create a new organization. The creator is automatically added as a
 * member with the "owner" role.
 */
export function createOrganization(
  deps: Dependencies,
  input: CreateOrganizationInput
): Result<{ organization: Organization; membership: Membership }> {
  const validated = validateCreateOrganizationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  // Slug uniqueness.
  if (deps.store.getOrganizationBySlug(v.slug)) {
    return err(ErrorCode.CONFLICT, "slug already exists");
  }

  const orgId = asTenantId("org_" + Math.random().toString(36).slice(2, 12));
  const now = new Date().toISOString();
  const organization: Organization = {
    id: orgId,
    name: v.name,
    slug: v.slug.toLowerCase(),
    industry: v.industry,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  deps.store.putOrganization(organization);

  // Add creator as owner.
  const creatorUserId = asEntityId(v.creatorUserId);
  const membership: Membership = {
    id: asEntityId("mem_" + Math.random().toString(36).slice(2, 12)),
    organizationId: orgId,
    userId: creatorUserId,
    role: "owner",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  deps.store.putMembership(membership);

  deps.audit.record(
    createAuditEntry({
      tenantId: orgId,
      actorUserId: asUserId(creatorUserId),
      componentId: "core/organizations",
      action: "organization.created",
      entityType: "organization",
      entityId: orgId,
      details: { name: v.name, slug: v.slug, industry: v.industry },
    })
  );

  return ok({ organization, membership });
}

/**
 * Invite a user (by email) to join an organization with a specific role.
 * Generates a single-use, time-limited token that the invitee uses to accept.
 */
export function inviteMember(
  deps: Dependencies,
  input: InviteMemberInput
): Result<Invitation> {
  const validated = validateInviteMemberInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  const orgId = asTenantId(v.organizationId);
  const org = deps.store.getOrganization(orgId);
  if (!org) {
    return err(ErrorCode.NOT_FOUND, "organization not found");
  }

  // Cap check.
  const activeMembers = deps.store.listMembershipsForOrganization(orgId)
    .filter((m) => m.status === "active").length;
  if (activeMembers >= deps.config.maxMembersPerOrganization) {
    return err(ErrorCode.LIMIT_EXCEEDED, "organization at max members");
  }

  // Check if the email is already an active member.
  // (We can't check by email directly because memberships are by userId;
  // the HTTP layer resolves email → userId before calling. For this
  // increment, we allow duplicate invitations — the accept flow handles
  // deduplication.)

  const invitedBy = asEntityId(v.invitedByUserId);
  const token = randomBytes(32).toString("base64url");
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + deps.config.invitationExpiryHours * 3600 * 1000).toISOString();
  const invitation: Invitation = {
    id: asEntityId("inv_" + Math.random().toString(36).slice(2, 12)),
    organizationId: orgId,
    email: v.email.toLowerCase(),
    role: v.role,
    token,
    status: "pending",
    expiresAt,
    invitedByUserId: invitedBy,
    createdAt: now,
    updatedAt: now,
  };
  deps.store.putInvitation(invitation);

  deps.audit.record(
    createAuditEntry({
      tenantId: orgId,
      actorUserId: asUserId(invitedBy),
      componentId: "core/organizations",
      action: "organization.invitation.sent",
      entityType: "invitation",
      entityId: invitation.id,
      details: { email: invitation.email, role: v.role },
    })
  );

  return ok(invitation);
}

/**
 * Accept an invitation. The user must already exist (registered via
 * core/identity). Creates an active membership and marks the invitation
 * as accepted.
 */
export function acceptInvitation(
  deps: Dependencies,
  input: AcceptInvitationInput
): Result<Membership> {
  const validated = validateAcceptInvitationInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  const invitation = deps.store.getInvitationByToken(v.token);
  if (!invitation || invitation.status !== "pending") {
    return err(ErrorCode.NOT_FOUND, "invitation not found or already used");
  }
  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    deps.store.putInvitation({ ...invitation, status: "expired" });
    return err(ErrorCode.BUSINESS_RULE_VIOLATION, "invitation has expired");
  }

  const userId = asEntityId(v.userId);
  // Check if the user is already a member.
  const existing = deps.store.findMembership(invitation.organizationId, userId);
  if (existing) {
    // Idempotent: mark the invitation as accepted and return the existing membership.
    deps.store.putInvitation({ ...invitation, status: "accepted" });
    return ok(existing);
  }

  const now = new Date().toISOString();
  const membership: Membership = {
    id: asEntityId("mem_" + Math.random().toString(36).slice(2, 12)),
    organizationId: invitation.organizationId,
    userId,
    role: invitation.role,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  deps.store.putMembership(membership);
  deps.store.putInvitation({ ...invitation, status: "accepted" });

  deps.audit.record(
    createAuditEntry({
      tenantId: invitation.organizationId,
      actorUserId: asUserId(userId),
      componentId: "core/organizations",
      action: "organization.invitation.accepted",
      entityType: "membership",
      entityId: membership.id,
      details: { role: invitation.role },
    })
  );

  return ok(membership);
}

/**
 * Revoke a membership. The user loses access to the organization.
 * Cannot revoke the last owner (must transfer ownership first).
 */
export function revokeMembership(
  deps: Dependencies,
  input: RevokeMembershipInput
): Result<Membership> {
  const validated = validateRevokeMembershipInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;

  const id = asEntityId(v.membershipId);
  const membership = deps.store.getMembership(id);
  if (!membership) {
    return err(ErrorCode.NOT_FOUND, "membership not found");
  }
  if (membership.status !== "active") {
    return err(ErrorCode.BUSINESS_RULE_VIOLATION, "membership is not active");
  }

  // If the membership is an owner, check there is at least one other active owner.
  if (membership.role === "owner") {
    const owners = deps.store.listMembershipsForOrganization(membership.organizationId)
      .filter((m) => m.role === "owner" && m.status === "active");
    if (owners.length <= 1) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot revoke the last owner — transfer ownership first");
    }
  }

  const updated: Membership = {
    ...membership,
    status: "revoked",
    updatedAt: new Date().toISOString(),
  };
  deps.store.putMembership(updated);

  deps.audit.record(
    createAuditEntry({
      tenantId: membership.organizationId,
      actorUserId: asUserId(membership.userId), // the user being revoked; the HTTP layer overrides if an admin does it
      componentId: "core/organizations",
      action: "organization.membership.revoked",
      entityType: "membership",
      entityId: id,
      details: { role: membership.role },
    })
  );

  return ok(updated);
}

/**
 * List all organizations a user is an active member of. Used to build
 * the user's "organization switcher" in the UI.
 */
export function listOrganizationsForUser(
  deps: Dependencies,
  userId: EntityId
): Result<readonly Organization[]> {
  const memberships = deps.store.listMembershipsForUser(userId)
    .filter((m) => m.status === "active");
  const orgs = memberships
    .map((m) => deps.store.getOrganization(m.organizationId))
    .filter((o): o is Organization => Boolean(o) && o!.status === "active");
  return ok(orgs);
}

/**
 * Resolve a tenant by slug. Used by the HTTP layer's tenant resolver
 * middleware to turn a request hostname or path into a TenantId.
 */
export function resolveTenantBySlug(
  deps: Dependencies,
  slug: string
): Result<Organization> {
  const org = deps.store.getOrganizationBySlug(slug);
  if (!org) {
    return err(ErrorCode.NOT_FOUND, "tenant not found");
  }
  if (org.status !== "active") {
    return err(ErrorCode.PERMISSION_DENIED, "tenant is not active");
  }
  return ok(org);
}
