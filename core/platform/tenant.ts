/**
 * Tenant context primitives.
 *
 * Every operation on Business OS runs on behalf of a specific tenant. These
 * types are the minimum surface every component needs to declare and enforce
 * tenant isolation.
 *
 * See: ai-instructions/architecture-rules.md §3 (Multi-Tenant Architecture)
 * See: ai-instructions/security-rules.md §3 (Tenant boundaries)
 */

/**
 * Stable identifier for a tenant. String-based, opaque, no internal structure
 * that callers should rely on.
 */
export type TenantId = string & { readonly __brand: "TenantId" };

/**
 * Stable identifier for a user. Same shape rules as TenantId.
 */
export type UserId = string & { readonly __brand: "UserId" };

/**
 * TenantContext is passed into every component operation. It represents the
 * *resolved* tenant of the current request — never trust a tenant id supplied
 * by the caller's payload, always use the value from the resolved context.
 */
export interface TenantContext {
  readonly tenantId: TenantId;
  readonly userId: UserId;
  /**
   * Roles the user holds *within this tenant*. A user may be an admin in
   * tenant A and a viewer in tenant B — the context is per-tenant.
   */
  readonly roles: ReadonlyArray<string>;
  /**
   * Wall-clock timestamp at which the context was resolved. Used for audit
   * entries and replay protection. ISO-8601 string.
   */
  readonly resolvedAt: string;
}

/**
 * Helper to brand a plain string into a TenantId. Centralised so that
 * components never construct tenant ids ad-hoc.
 */
export function asTenantId(value: string): TenantId {
  if (!value || value.trim().length === 0) {
    throw new Error("TenantId must be a non-empty string");
  }
  return value as TenantId;
}

/**
 * Helper to brand a plain string into a UserId.
 */
export function asUserId(value: string): UserId {
  if (!value || value.trim().length === 0) {
    throw new Error("UserId must be a non-empty string");
  }
  return value as UserId;
}

/**
 * Build a TenantContext from raw inputs. Centralised construction prevents
 * components from inventing their own context shapes.
 */
export function createTenantContext(input: {
  tenantId: string;
  userId: string;
  roles?: ReadonlyArray<string>;
  resolvedAt?: string;
}): TenantContext {
  return {
    tenantId: asTenantId(input.tenantId),
    userId: asUserId(input.userId),
    roles: input.roles ? [...input.roles] : [],
    resolvedAt: input.resolvedAt ?? new Date().toISOString(),
  };
}

/**
 * Assert that a resource belongs to the same tenant as the context. Throws a
 * `TenantIsolationError` if not. Used at the boundary of every cross-tenant
 * read or write.
 *
 * The error message deliberately does not reveal which side mismatched, to
 * avoid leaking information to a caller probing tenant boundaries.
 */
export function assertSameTenant(
  ctx: TenantContext,
  resourceTenantId: TenantId | string
): void {
  const a = ctx.tenantId;
  const b = typeof resourceTenantId === "string" ? resourceTenantId : resourceTenantId;
  if (a !== b) {
    throw new TenantIsolationError("tenant boundary violation");
  }
}

/**
 * Non-fatal variant: returns true if the resource belongs to the context's
 * tenant, false otherwise. Used by filters and list queries.
 */
export function isSameTenant(
  ctx: TenantContext,
  resourceTenantId: TenantId | string
): boolean {
  return ctx.tenantId === (typeof resourceTenantId === "string" ? resourceTenantId : resourceTenantId);
}

/**
 * Error thrown when a tenant boundary is violated. Carries a stable code so
 * that callers (and tests) can match on it without parsing message text.
 */
export class TenantIsolationError extends Error {
  readonly code = "TENANT_ISOLATION_VIOLATION";
  constructor(message = "tenant boundary violation") {
    super(message);
    this.name = "TenantIsolationError";
  }
}
