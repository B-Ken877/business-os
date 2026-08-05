/**
 * Domain types for the authorization module.
 *
 * Authorization answers: "what is this user allowed to do, in this tenant?"
 * It is separate from authentication (identity) per security-rules.md §3.
 */

import type { EntityId, TenantId, UserId, Permission } from "@business-os/shared";

/**
 * A role definition — a named bundle of permissions assignable to users.
 * Roles are per-tenant: "manager" in tenant A has no meaning in tenant B.
 */
export interface RoleDefinition {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly description: string;
  /** The permissions this role grants. */
  readonly permissions: ReadonlyArray<Permission>;
  /** True if this is a platform-seeded role (cannot be deleted). */
  readonly isSystem: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * A grant — assigns a role to a user within a tenant.
 * Equivalent to the membership's role field in core/organizations, but
 * stored separately so permissions can be checked without loading the
 * full membership record.
 */
export interface RoleGrant {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  readonly userId: UserId;
  readonly roleName: string;
  readonly status: RoleGrantStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type RoleGrantStatus = "active" | "revoked";

/**
 * Well-known system roles seeded for every new tenant.
 */
export const SYSTEM_ROLES = {
  OWNER: "owner",
  ADMINISTRATOR: "administrator",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

/**
 * The permission set granted to each system role by default.
 * Tenants can customize roles after creation, but system roles cannot
 * be deleted.
 */
export const SYSTEM_ROLE_PERMISSIONS: Readonly<Record<string, ReadonlyArray<string>>> = {
  [SYSTEM_ROLES.OWNER]: [
    "*.*", // owner can do everything — the HTTP layer expands wildcards
  ],
  [SYSTEM_ROLES.ADMINISTRATOR]: [
    "organization.invite",
    "organization.manage_members",
    "roles.manage",
    "roles.read",
    "permissions.read",
  ],
  [SYSTEM_ROLES.MEMBER]: [
    // members can read most things; specific permissions are per-component
  ],
  [SYSTEM_ROLES.VIEWER]: [
    // viewers can only read; specific permissions are per-component
  ],
};
