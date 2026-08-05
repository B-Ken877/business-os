/**
 * SQLite implementation of the AuditLogStore interface (from core/audit-log).
 *
 * Per security-rules.md §5, audit entries are APPEND-ONLY. This store
 * has no update() or delete() methods — the SQL schema does not define
 * any UPDATE or DELETE statements for the audit_log table, and no
 * code path in the platform issues them.
 */

import type { DatabaseType } from "../database";
import type { AuditEntry, TenantId } from "@business-os/shared";
import type { AuditQuery, AuditQueryResult } from "@business-os/core/audit-log";
import type { AuditLogStore } from "@business-os/core/audit-log";

interface AuditRow {
  id: string; tenant_id: string; actor_user_id: string; at: string;
  component_id: string; action: string; entity_type: string; entity_id: string;
  details: string;
}

function rowToEntry(r: AuditRow): AuditEntry {
  return {
    id: r.id,
    tenantId: r.tenant_id as TenantId,
    actorUserId: r.actor_user_id as any,
    at: r.at,
    componentId: r.component_id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    details: Object.freeze(JSON.parse(r.details) as Record<string, unknown>),
  };
}

export class SqliteAuditLogStore implements AuditLogStore {
  constructor(private readonly db: DatabaseType) {}

  record(entry: AuditEntry): void {
    this.db.prepare(`
      INSERT INTO audit_log (id, tenant_id, actor_user_id, at, component_id, action, entity_type, entity_id, details)
      VALUES (@id, @tenant_id, @actor_user_id, @at, @component_id, @action, @entity_type, @entity_id, @details)
    `).run({
      id: entry.id,
      tenant_id: entry.tenantId,
      actor_user_id: entry.actorUserId,
      at: entry.at,
      component_id: entry.componentId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId,
      details: JSON.stringify(entry.details),
    });
  }

  list(query: AuditQuery): readonly AuditEntry[] {
    const { sql, params } = this.buildQuery(query);
    const rows = this.db.prepare(sql).all(...params) as AuditRow[];
    return rows.map(rowToEntry);
  }

  count(query: Omit<AuditQuery, "limit" | "cursor">): number {
    const { sql, params } = this.buildQuery({ ...query, limit: undefined, cursor: undefined });
    const countSql = sql.replace("SELECT *", "SELECT COUNT(*) as cnt").replace(/ORDER BY.*$/s, "").replace(/LIMIT.*$/s, "");
    const row = this.db.prepare(countSql).get(...params) as { cnt: number };
    return row.cnt;
  }

  private buildQuery(query: AuditQuery): { sql: string; params: unknown[] } {
    const conditions: string[] = ["tenant_id = ?"];
    const params: unknown[] = [query.tenantId];

    if (query.componentId) { conditions.push("component_id = ?"); params.push(query.componentId); }
    if (query.action) { conditions.push("action = ?"); params.push(query.action); }
    if (query.entityType) { conditions.push("entity_type = ?"); params.push(query.entityType); }
    if (query.entityId) { conditions.push("entity_id = ?"); params.push(query.entityId); }
    if (query.actorUserId) { conditions.push("actor_user_id = ?"); params.push(query.actorUserId); }
    if (query.fromAt) { conditions.push("at >= ?"); params.push(query.fromAt); }
    if (query.toAt) { conditions.push("at <= ?"); params.push(query.toAt); }

    let sql = `SELECT * FROM audit_log WHERE ${conditions.join(" AND ")} ORDER BY at DESC`;
    const limit = query.limit ?? 100;
    const cursorIndex = query.cursor ? parseInt(query.cursor, 10) : 0;
    sql += ` LIMIT ${limit + 1} OFFSET ${Math.max(0, cursorIndex)}`;

    return { sql, params };
  }
}
