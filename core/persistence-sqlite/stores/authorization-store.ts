/**
 * SQLite implementation of the AuthorizationStore interface (from core/authorization).
 */

import type { DatabaseType } from "../database";
import type { EntityId, TenantId, UserId, Permission } from "@business-os/shared";
import type { RoleDefinition, RoleGrant } from "@business-os/core/authorization";
import type { AuthorizationStore } from "@business-os/core/authorization";

interface RoleDefRow {
  id: string; tenant_id: string; name: string; description: string;
  permissions: string; is_system: number; created_at: string; updated_at: string;
}
interface GrantRow {
  id: string; tenant_id: string; user_id: string; role_name: string;
  status: string; created_at: string; updated_at: string;
}

function rowToRoleDef(r: RoleDefRow): RoleDefinition {
  return {
    id: r.id as EntityId,
    tenantId: r.tenant_id as TenantId,
    name: r.name,
    description: r.description,
    permissions: JSON.parse(r.permissions) as Permission[],
    isSystem: r.is_system === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToGrant(r: GrantRow): RoleGrant {
  return {
    id: r.id as EntityId,
    tenantId: r.tenant_id as TenantId,
    userId: r.user_id as UserId,
    roleName: r.role_name,
    status: r.status as RoleGrant["status"],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export class SqliteAuthorizationStore implements AuthorizationStore {
  constructor(private readonly db: DatabaseType) {}

  getRoleDefinition(tenantId: TenantId, name: string): RoleDefinition | undefined {
    const row = this.db.prepare(
      "SELECT * FROM role_definitions WHERE tenant_id = ? AND name = ?"
    ).get(tenantId, name) as RoleDefRow | undefined;
    return row ? rowToRoleDef(row) : undefined;
  }

  putRoleDefinition(role: RoleDefinition): void {
    this.db.prepare(`
      INSERT INTO role_definitions (id, tenant_id, name, description, permissions, is_system, created_at, updated_at)
      VALUES (@id, @tenant_id, @name, @description, @permissions, @is_system, @created_at, @updated_at)
      ON CONFLICT(tenant_id, name) DO UPDATE SET
        description = @description, permissions = @permissions, is_system = @is_system, updated_at = @updated_at
    `).run({
      id: role.id, tenant_id: role.tenantId, name: role.name,
      description: role.description, permissions: JSON.stringify(role.permissions),
      is_system: role.isSystem ? 1 : 0,
      created_at: role.createdAt, updated_at: role.updatedAt,
    });
  }

  listRoleDefinitions(tenantId: TenantId): readonly RoleDefinition[] {
    const rows = this.db.prepare("SELECT * FROM role_definitions WHERE tenant_id = ?").all(tenantId) as RoleDefRow[];
    return rows.map(rowToRoleDef);
  }

  deleteRoleDefinition(tenantId: TenantId, name: string): boolean {
    const result = this.db.prepare(
      "DELETE FROM role_definitions WHERE tenant_id = ? AND name = ? AND is_system = 0"
    ).run(tenantId, name);
    return result.changes > 0;
  }

  putRoleGrant(grant: RoleGrant): void {
    this.db.prepare(`
      INSERT INTO role_grants (id, tenant_id, user_id, role_name, status, created_at, updated_at)
      VALUES (@id, @tenant_id, @user_id, @role_name, @status, @created_at, @updated_at)
      ON CONFLICT(tenant_id, user_id, role_name) DO UPDATE SET
        status = @status, updated_at = @updated_at
    `).run({
      id: grant.id, tenant_id: grant.tenantId, user_id: grant.userId,
      role_name: grant.roleName, status: grant.status,
      created_at: grant.createdAt, updated_at: grant.updatedAt,
    });
  }

  listActiveGrantsForUser(tenantId: TenantId, userId: UserId): readonly RoleGrant[] {
    const rows = this.db.prepare(
      "SELECT * FROM role_grants WHERE tenant_id = ? AND user_id = ? AND status = 'active'"
    ).all(tenantId, userId) as GrantRow[];
    return rows.map(rowToGrant);
  }

  findActiveGrant(tenantId: TenantId, userId: UserId, roleName: string): RoleGrant | undefined {
    const row = this.db.prepare(
      "SELECT * FROM role_grants WHERE tenant_id = ? AND user_id = ? AND role_name = ? AND status = 'active'"
    ).get(tenantId, userId, roleName) as GrantRow | undefined;
    return row ? rowToGrant(row) : undefined;
  }
}
