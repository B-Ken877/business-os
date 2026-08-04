/**
 * SQLite implementation of the OrganizationsStore interface (from core/organizations).
 */

import type { DatabaseType } from "../database";
import type { EntityId, TenantId } from "@business-os/shared";
import type { Organization, Membership, Invitation } from "@business-os/core/organizations";
import type { OrganizationsStore } from "@business-os/core/organizations";

interface OrgRow {
  id: string; name: string; slug: string; industry: string; status: string;
  created_at: string; updated_at: string;
}
interface MembershipRow {
  id: string; organization_id: string; user_id: string; role: string; status: string;
  created_at: string; updated_at: string;
}
interface InvitationRow {
  id: string; organization_id: string; email: string; role: string; token: string;
  status: string; expires_at: string; invited_by_user_id: string;
  created_at: string; updated_at: string;
}

function rowToOrg(r: OrgRow): Organization {
  return {
    id: r.id as TenantId, name: r.name, slug: r.slug, industry: r.industry,
    status: r.status as Organization["status"],
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToMembership(r: MembershipRow): Membership {
  return {
    id: r.id as EntityId,
    organizationId: r.organization_id as TenantId,
    userId: r.user_id as EntityId,
    role: r.role,
    status: r.status as Membership["status"],
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

function rowToInvitation(r: InvitationRow): Invitation {
  return {
    id: r.id as EntityId,
    organizationId: r.organization_id as TenantId,
    email: r.email,
    role: r.role,
    token: r.token,
    status: r.status as Invitation["status"],
    expiresAt: r.expires_at,
    invitedByUserId: r.invited_by_user_id as EntityId,
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

export class SqliteOrganizationsStore implements OrganizationsStore {
  constructor(private readonly db: DatabaseType) {}

  getOrganization(id: TenantId): Organization | undefined {
    const row = this.db.prepare("SELECT * FROM organizations WHERE id = ?").get(id) as OrgRow | undefined;
    return row ? rowToOrg(row) : undefined;
  }

  getOrganizationBySlug(slug: string): Organization | undefined {
    const row = this.db.prepare("SELECT * FROM organizations WHERE slug = ?").get(slug.toLowerCase()) as OrgRow | undefined;
    return row ? rowToOrg(row) : undefined;
  }

  putOrganization(org: Organization): void {
    this.db.prepare(`
      INSERT INTO organizations (id, name, slug, industry, status, created_at, updated_at)
      VALUES (@id, @name, @slug, @industry, @status, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        name = @name, slug = @slug, industry = @industry, status = @status, updated_at = @updated_at
    `).run({
      id: org.id, name: org.name, slug: org.slug, industry: org.industry,
      status: org.status, created_at: org.createdAt, updated_at: org.updatedAt,
    });
  }

  listOrganizations(): readonly Organization[] {
    const rows = this.db.prepare("SELECT * FROM organizations").all() as OrgRow[];
    return rows.map(rowToOrg);
  }

  getMembership(id: EntityId): Membership | undefined {
    const row = this.db.prepare("SELECT * FROM memberships WHERE id = ?").get(id) as MembershipRow | undefined;
    return row ? rowToMembership(row) : undefined;
  }

  putMembership(m: Membership): void {
    this.db.prepare(`
      INSERT INTO memberships (id, organization_id, user_id, role, status, created_at, updated_at)
      VALUES (@id, @organization_id, @user_id, @role, @status, @created_at, @updated_at)
      ON CONFLICT(id) DO UPDATE SET
        role = @role, status = @status, updated_at = @updated_at
    `).run({
      id: m.id, organization_id: m.organizationId, user_id: m.userId,
      role: m.role, status: m.status, created_at: m.createdAt, updated_at: m.updatedAt,
    });
  }

  listMembershipsForOrganization(orgId: TenantId): readonly Membership[] {
    const rows = this.db.prepare("SELECT * FROM memberships WHERE organization_id = ?").all(orgId) as MembershipRow[];
    return rows.map(rowToMembership);
  }

  listMembershipsForUser(userId: EntityId): readonly Membership[] {
    const rows = this.db.prepare("SELECT * FROM memberships WHERE user_id = ?").all(userId) as MembershipRow[];
    return rows.map(rowToMembership);
  }

  findMembership(orgId: TenantId, userId: EntityId): Membership | undefined {
    const row = this.db.prepare(
      "SELECT * FROM memberships WHERE organization_id = ? AND user_id = ? AND status = 'active'"
    ).get(orgId, userId) as MembershipRow | undefined;
    return row ? rowToMembership(row) : undefined;
  }

  getInvitationByToken(token: string): Invitation | undefined {
    const row = this.db.prepare("SELECT * FROM invitations WHERE token = ?").get(token) as InvitationRow | undefined;
    return row ? rowToInvitation(row) : undefined;
  }

  putInvitation(inv: Invitation): void {
    this.db.prepare(`
      INSERT INTO invitations (id, organization_id, email, role, token, status, expires_at, invited_by_user_id, created_at, updated_at)
      VALUES (@id, @organization_id, @email, @role, @token, @status, @expires_at, @invited_by_user_id, @created_at, @updated_at)
      ON CONFLICT(token) DO UPDATE SET
        status = @status, updated_at = @updated_at
    `).run({
      id: inv.id, organization_id: inv.organizationId, email: inv.email, role: inv.role,
      token: inv.token, status: inv.status, expires_at: inv.expiresAt,
      invited_by_user_id: inv.invitedByUserId, created_at: inv.createdAt, updated_at: inv.updatedAt,
    });
  }

  listInvitationsForOrganization(orgId: TenantId): readonly Invitation[] {
    const rows = this.db.prepare("SELECT * FROM invitations WHERE organization_id = ?").all(orgId) as InvitationRow[];
    return rows.map(rowToInvitation);
  }
}
