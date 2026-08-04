/**
 * Audit entry primitives.
 *
 * Every state-changing operation in a reusable component must produce an
 * audit entry. Entries are immutable once created and are the source of
 * truth for "who did what, when, and from where".
 *
 * See: ai-instructions/security-rules.md §5 (Clinics — strict access logging)
 * See: ai-instructions/architecture-rules.md §1 (Core capabilities — Audit logs)
 */

import type { TenantId, UserId } from "./tenant";

/**
 * AuditEntry is the structured shape every audit log row must satisfy. It is
 * deliberately minimal — components add their own `details` payload but
 * cannot omit the standard fields.
 */
export interface AuditEntry {
  /** Stable identifier for the audit row. */
  readonly id: string;
  /** Tenant the event belongs to. Always scoped, never cross-tenant. */
  readonly tenantId: TenantId;
  /** User who triggered the event. */
  readonly actorUserId: UserId;
  /** ISO-8601 timestamp. */
  readonly at: string;
  /** Component ID that emitted the event (e.g. `retail-inventory`). */
  readonly componentId: string;
  /** Action that was performed (e.g. `stock.adjusted`). */
  readonly action: string;
  /** Type of entity affected (e.g. `product`). */
  readonly entityType: string;
  /** Identifier of the entity affected. */
  readonly entityId: string;
  /** Structured, component-specific details. Never secrets. */
  readonly details: Readonly<Record<string, unknown>>;
}

/**
 * Factory for AuditEntry. Centralises ID generation and field validation so
 * components cannot accidentally emit malformed entries.
 */
export function createAuditEntry(input: {
  tenantId: TenantId;
  actorUserId: UserId;
  componentId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  at?: string;
}): AuditEntry {
  if (!input.componentId) {
    throw new Error("AuditEntry requires componentId");
  }
  if (!input.action) {
    throw new Error("AuditEntry requires action");
  }
  if (!input.entityType) {
    throw new Error("AuditEntry requires entityType");
  }
  if (!input.entityId) {
    throw new Error("AuditEntry requires entityId");
  }
  return {
    id: `aud_${randomId()}`,
    tenantId: input.tenantId,
    actorUserId: input.actorUserId,
    at: input.at ?? new Date().toISOString(),
    componentId: input.componentId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: Object.freeze({ ...(input.details ?? {}) }),
  };
}

/**
 * Interface every component should implement to expose its audit stream.
 * The platform's audit log aggregator will call this to drain entries.
 */
export interface AuditSink {
  record(entry: AuditEntry): void;
}

/**
 * In-memory AuditSink used by tests. Components accept an `AuditSink` through
 * dependency injection so tests can supply this and production code can
 * supply the platform-backed sink.
 */
export class InMemoryAuditSink implements AuditSink {
  private readonly entries: AuditEntry[] = [];

  record(entry: AuditEntry): void {
    this.entries.push(entry);
  }

  list(): readonly AuditEntry[] {
    return [...this.entries];
  }

  filter(predicate: (entry: AuditEntry) => boolean): readonly AuditEntry[] {
    return this.entries.filter(predicate);
  }

  clear(): void {
    this.entries.length = 0;
  }
}

/**
 * Internal: small random id generator. NOT cryptographically secure — audit
 * ids only need to be unique within a tenant's stream. The platform's
 * production AuditSink may override the id if a stronger generator is needed.
 */
function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
