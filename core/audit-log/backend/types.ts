/**
 * Domain types for the audit-log module.
 *
 * The audit log is the immutable record of "who did what, when, and from
 * where" on the platform. See ai-instructions/architecture-rules.md §1
 * (Core capabilities — Audit logs) and security-rules.md §5 (Clinics —
 * strict access logging).
 *
 * This module re-exports the AuditEntry type from @business-os/shared and
 * adds queryable types on top.
 */

import type { AuditEntry, TenantId, EntityId } from "@business-os/shared";

// Re-export so consumers can import everything from one place.
export type { AuditEntry } from "@business-os/shared";

/**
 * Query parameters for listing audit entries.
 */
export interface AuditQuery {
  readonly tenantId: TenantId;
  readonly componentId?: string;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly actorUserId?: string;
  readonly fromAt?: string;
  readonly toAt?: string;
  readonly limit?: number;
  readonly cursor?: string;
}

/**
 * Result of an audit query, with a cursor for pagination.
 */
export interface AuditQueryResult {
  readonly entries: ReadonlyArray<AuditEntry>;
  readonly nextCursor: string | null;
}
