/**
 * Business logic for the audit-log module.
 *
 * Provides:
 *   1. `PersistentAuditSink` — the production AuditSink that writes to a
 *      store. Every component's audit calls go through this.
 *   2. Query operations for the audit trail UI.
 *
 * Audit entries are immutable once recorded — there is no update or
 * delete operation. This is intentional: an audit log that can be edited
 * is not an audit log.
 */

import {
  type AuditEntry,
  type AuditSink,
  type TenantContext,
  type Result,
  type TenantId,
  ok,
  err,
  createAuditEntry,
  ErrorCode,
} from "@business-os/shared";
import type { AuditQuery, AuditQueryResult } from "./types";

// ---------------------------------------------------------------------------
// Persistence interface
// ---------------------------------------------------------------------------

export interface AuditLogStore {
  record(entry: AuditEntry): void;
  list(query: AuditQuery): readonly AuditEntry[];
  count(query: Omit<AuditQuery, "limit" | "cursor">): number;
}

export class InMemoryAuditLogStore implements AuditLogStore {
  private readonly entries: AuditEntry[] = [];

  record(entry: AuditEntry): void {
    this.entries.push(entry);
  }

  list(query: AuditQuery): readonly AuditEntry[] {
    let filtered = this.filter(query);
    // Sort newest-first.
    filtered = [...filtered].sort((a, b) => b.at.localeCompare(a.at));
    const limit = query.limit ?? 100;
    const cursorIndex = query.cursor ? parseInt(query.cursor, 10) : 0;
    const start = Math.max(0, cursorIndex);
    return filtered.slice(start, start + limit);
  }

  count(query: Omit<AuditQuery, "limit" | "cursor">): number {
    return this.filter(query).length;
  }

  private filter(query: Omit<AuditQuery, "limit" | "cursor">): AuditEntry[] {
    return this.entries.filter((e) => {
      if (e.tenantId !== query.tenantId) return false;
      if (query.componentId && e.componentId !== query.componentId) return false;
      if (query.action && e.action !== query.action) return false;
      if (query.entityType && e.entityType !== query.entityType) return false;
      if (query.entityId && e.entityId !== query.entityId) return false;
      if (query.actorUserId && e.actorUserId !== query.actorUserId) return false;
      if (query.fromAt && e.at < query.fromAt) return false;
      if (query.toAt && e.at > query.toAt) return false;
      return true;
    });
  }
}

// ---------------------------------------------------------------------------
// The production AuditSink
// ---------------------------------------------------------------------------

/**
 * Persistent AuditSink backed by an AuditLogStore.
 *
 * Components accept an `AuditSink` through dependency injection. In tests,
 * they use `InMemoryAuditSink` from @business-os/shared. In production,
 * they use this class — which writes to the platform's audit log store.
 */
export class PersistentAuditSink implements AuditSink {
  constructor(private readonly store: AuditLogStore) {}

  record(entry: AuditEntry): void {
    this.store.record(entry);
  }
}

// ---------------------------------------------------------------------------
// Dependencies
// ---------------------------------------------------------------------------

export interface AuditLogConfig {
  readonly defaultPageSize: number;
  readonly maxPageSize: number;
}

export const defaultAuditLogConfig: AuditLogConfig = {
  defaultPageSize: 100,
  maxPageSize: 500,
};

export interface Dependencies {
  readonly store: AuditLogStore;
  readonly config: AuditLogConfig;
}

// ---------------------------------------------------------------------------
// Operations
// ---------------------------------------------------------------------------

/**
 * Query the audit log for a tenant. Results are scoped to the tenant —
 * cross-tenant queries are impossible through this API.
 */
export function queryAuditLog(deps: Dependencies, query: AuditQuery): Result<AuditQueryResult> {
  if (!query.tenantId) {
    return err(ErrorCode.INVALID_INPUT, "tenantId is required");
  }
  if (query.fromAt && query.toAt && query.fromAt > query.toAt) {
    return err(ErrorCode.INVALID_INPUT, "fromAt must be <= toAt");
  }
  const limit = Math.min(
    query.limit ?? deps.config.defaultPageSize,
    deps.config.maxPageSize
  );
  const entries = deps.store.list({ ...query, limit: limit + 1 }); // +1 to detect next page
  const hasMore = entries.length > limit;
  const page = entries.slice(0, limit);
  const cursorIndex = query.cursor ? parseInt(query.cursor, 10) : 0;
  const nextCursor = hasMore ? String(cursorIndex + limit) : null;
  return ok({ entries: page, nextCursor });
}

/**
 * Count audit entries matching a query. Useful for dashboards ("47 actions today").
 */
export function countAuditEntries(
  deps: Dependencies,
  query: Omit<AuditQuery, "limit" | "cursor">
): Result<number> {
  if (!query.tenantId) {
    return err(ErrorCode.INVALID_INPUT, "tenantId is required");
  }
  return ok(deps.store.count(query));
}

/**
 * Convenience: record an audit entry directly. Used by the HTTP layer
 * for events that don't belong to any component (e.g. "user logged in").
 */
export function recordAuditEntry(
  deps: Dependencies,
  input: {
    tenantId: TenantId;
    actorUserId: string;
    componentId: string;
    action: string;
    entityType: string;
    entityId: string;
    details?: Record<string, unknown>;
  }
): Result<AuditEntry> {
  const entry = createAuditEntry({
    tenantId: input.tenantId,
    actorUserId: input.actorUserId as any,
    componentId: input.componentId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    details: input.details,
  });
  deps.store.record(entry);
  return ok(entry);
}
