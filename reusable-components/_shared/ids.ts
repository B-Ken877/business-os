/**
 * Entity identifier primitives.
 *
 * All entities on the platform use a string id. The brand prevents accidental
 * mixing of unrelated id types (a ProductId is not interchangeable with a
 * CustomerId even though both are strings).
 */

export type EntityId = string & { readonly __brand: "EntityId" };

/**
 * Brand a plain string into an EntityId. Used by component factories.
 */
export function asEntityId(value: string): EntityId {
  if (!value || value.trim().length === 0) {
    throw new Error("EntityId must be a non-empty string");
  }
  return value as EntityId;
}

/**
 * Generate a new random EntityId. Not cryptographically secure — uniqueness
 * within a tenant is sufficient. Format: `ent_<base36>`.
 *
 * In tests, callers should pass explicit ids rather than relying on this
 * generator, so that assertions are deterministic.
 */
export function generateId(prefix = "ent"): EntityId {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}` as EntityId;
}
