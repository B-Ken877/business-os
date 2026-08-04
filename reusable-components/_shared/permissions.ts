/**
 * Permission primitives.
 *
 * See: ai-instructions/security-rules.md §3 (Authorization Rules)
 * See: ai-instructions/architecture-rules.md §3 (Roles are per-tenant)
 */

import type { TenantContext } from "./tenant";

/**
 * A permission is expressed as `<resource>.<action>` — for example,
 * `inventory.products.update`. Permissions are matched exactly, never by
 * prefix, to prevent accidental over-granting.
 */
export type Permission = string & { readonly __brand: "Permission" };

/**
 * A Role is a named bundle of permissions assigned to a user *within a
 * tenant*. Role names are per-tenant: "manager" in tenant A has no meaning
 * in tenant B.
 */
export interface Role {
  readonly name: string;
  readonly permissions: ReadonlyArray<Permission>;
}

/**
 * A PermissionChecker answers one question: does the user described by `ctx`
 * hold the given `permission`? The checker is the only legitimate way to
 * answer that question — components must never inspect `ctx.roles` directly.
 *
 * The interface is intentionally minimal so that the production implementation
 * (backed by the platform's authorization service) and the test implementation
 * (backed by a simple in-memory map) can both satisfy it.
 */
export interface PermissionChecker {
  has(ctx: TenantContext, permission: Permission): boolean;
  /**
   * Asserts the permission holds; throws `PermissionDeniedError` otherwise.
   * The error must NOT reveal which permission was missing — the caller
   * already knows, and revealing it to an attacker confirms what they don't
   * have.
   */
  require(ctx: TenantContext, permission: Permission): void;
}

/**
 * Brand a string into a Permission. Centralised so permissions are never
 * constructed ad-hoc inside component code.
 */
export function asPermission(value: string): Permission {
  if (!value || !value.includes(".")) {
    throw new Error(
      `Permission must be of the form '<resource>.<action>', got: ${JSON.stringify(value)}`
    );
  }
  return value as Permission;
}

/**
 * Error thrown when a required permission is missing. Carries a stable code.
 */
export class PermissionDeniedError extends Error {
  readonly code = "PERMISSION_DENIED";
  constructor(message = "permission denied") {
    super(message);
    this.name = "PermissionDeniedError";
  }
}

/**
 * A test-friendly PermissionChecker built from a map of
 * `userId -> Permission[]`. Components should accept a `PermissionChecker`
 * through dependency injection so tests can supply this implementation and
 * production code can supply the platform-backed one.
 *
 * The checker is tenant-aware: even if the same userId appears in multiple
 * tenants, the permissions list is per-tenant. The map key is
 * `${tenantId}::${userId}`.
 */
export class InMemoryPermissionChecker implements PermissionChecker {
  private readonly grants = new Map<string, Set<Permission>>();

  constructor(initial?: ReadonlyArray<{
    tenantId: string;
    userId: string;
    permissions: ReadonlyArray<Permission | string>;
  }>) {
    if (initial) {
      for (const entry of initial) {
        this.grant(entry.tenantId, entry.userId, entry.permissions);
      }
    }
  }

  grant(
    tenantId: string,
    userId: string,
    permissions: ReadonlyArray<Permission | string>
  ): this {
    const key = `${tenantId}::${userId}`;
    let set = this.grants.get(key);
    if (!set) {
      set = new Set();
      this.grants.set(key, set);
    }
    for (const p of permissions) {
      set.add(typeof p === "string" ? asPermission(p) : p);
    }
    return this;
  }

  revoke(
    tenantId: string,
    userId: string,
    permissions: ReadonlyArray<Permission | string>
  ): this {
    const key = `${tenantId}::${userId}`;
    const set = this.grants.get(key);
    if (!set) return this;
    for (const p of permissions) {
      set.delete(typeof p === "string" ? asPermission(p) : p);
    }
    return this;
  }

  has(ctx: TenantContext, permission: Permission): boolean {
    const key = `${ctx.tenantId}::${ctx.userId}`;
    const set = this.grants.get(key);
    return Boolean(set?.has(permission));
  }

  require(ctx: TenantContext, permission: Permission): void {
    if (!this.has(ctx, permission)) {
      throw new PermissionDeniedError();
    }
  }
}

/**
 * A PermissionChecker that denies everything. Useful as a default in tests
 * where the test wants to explicitly assert which permissions are required.
 */
export class DenyAllPermissionChecker implements PermissionChecker {
  has(_ctx: TenantContext, _permission: Permission): boolean {
    return false;
  }
  require(_ctx: TenantContext, _permission: Permission): void {
    throw new PermissionDeniedError();
  }
}
