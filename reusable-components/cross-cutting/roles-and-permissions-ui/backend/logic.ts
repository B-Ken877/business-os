/**
 * Business logic for the roles-and-permissions-ui component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  RoleDefinition,
} from "./types";

import {
  type DefineRoleInput,
  validateDefineRoleInput,
  type ListPermissionsForRoleInput,
  validateListPermissionsForRoleInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RolesAndPermissionsUiStore {
  getRoleDefinition(tenantId: string, id: EntityId): RoleDefinition | undefined;
  putRoleDefinition(tenantId: string, entity: RoleDefinition): void;
  listRoleDefinitions(tenantId: string): readonly RoleDefinition[];
  deleteRoleDefinition(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRolesAndPermissionsUiStore implements RolesAndPermissionsUiStore {
  private readonly roleDefinitions = new Map<string, Map<string, RoleDefinition>>();

  getRoleDefinition(tenantId: string, id: EntityId): RoleDefinition | undefined {
    return this.roleDefinitions.get(tenantId)?.get(id);
  }
  putRoleDefinition(tenantId: string, entity: RoleDefinition): void {
    let byId = this.roleDefinitions.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.roleDefinitions.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listRoleDefinitions(tenantId: string): readonly RoleDefinition[] {
    const byId = this.roleDefinitions.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteRoleDefinition(tenantId: string, id: EntityId): boolean {
    return this.roleDefinitions.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RolesAndPermissionsUiStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultRoleOnInvite: string;
  readonly allowOwnerRoleEditing: boolean;
}

//////////////////////////////////////////////////////////////////////
// defineRole — Define a new role for the tenant.
//////////////////////////////////////////////////////////////////////
export function defineRole(
  ctx: TenantContext,
  deps: Dependencies,
  input: DefineRoleInput
): Result<RoleDefinition> {
  deps.permissions.require(ctx, asPermission("roles.manage"));
  const validated = validateDefineRoleInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.name === "owner" && !deps.config.allowOwnerRoleEditing) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "the owner role cannot be redefined");
    }
    // Validate permissionsJson is a string array.
    let perms: string[];
    try {
      const parsed = JSON.parse(v.permissionsJson);
      if (!Array.isArray(parsed) || !parsed.every((p) => typeof p === "string")) {
        return err(ErrorCode.INVALID_INPUT, "permissionsJson must be a string array");
      }
      perms = parsed;
    } catch {
      return err(ErrorCode.INVALID_INPUT, "permissionsJson is not valid JSON");
    }
    // Validate each permission string is well-formed.
    for (const p of perms) {
      if (!p.includes(".")) {
        return err(ErrorCode.INVALID_INPUT, `permission '${p}' must be of the form '<resource>.<action>'`);
      }
    }
    const existing = deps.store.listRoleDefinitions(ctx.tenantId);
    if (existing.some((r) => r.name === v.name)) {
      return err(ErrorCode.CONFLICT, "role name already exists");
    }
    const id = asEntityId("role_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const role: RoleDefinition = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      description: v.description ?? "",
      permissionsJson: v.permissionsJson,
      isSystem: false,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putRoleDefinition(ctx.tenantId, role);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "roles-and-permissions-ui",
      action: "role.defined",
      entityType: "role_definition",
      entityId: id,
      details: { name: v.name, permissionCount: perms.length },
    }));
    return ok(role);
}

//////////////////////////////////////////////////////////////////////
// listRoles — List all roles defined in the tenant.
//////////////////////////////////////////////////////////////////////
export function listRoles(
  ctx: TenantContext,
  deps: Dependencies
): Result<readonly RoleDefinition[]> {
  deps.permissions.require(ctx, asPermission("roles.read"));
    const list = deps.store.listRoleDefinitions(ctx.tenantId);
    return ok(list);
}

//////////////////////////////////////////////////////////////////////
// listPermissionsForRole — Return the parsed permission list for a role.
//////////////////////////////////////////////////////////////////////
export function listPermissionsForRole(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListPermissionsForRoleInput
): Result<ReadonlyArray<string>> {
  deps.permissions.require(ctx, asPermission("permissions.read"));
  const validated = validateListPermissionsForRoleInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const list = deps.store.listRoleDefinitions(ctx.tenantId);
    const role = list.find((r) => r.name === v.roleName);
    if (!role) {
      return err(ErrorCode.NOT_FOUND, "role not found");
    }
    try {
      const perms = JSON.parse(role.permissionsJson);
      return ok(perms as string[]);
    } catch {
      return err(ErrorCode.DEPENDENCY_ERROR, "role has malformed permissionsJson");
    }
}
