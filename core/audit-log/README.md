# core/audit-log

> The immutable record of "who did what, when, and from where" — the platform's source of truth for accountability.

**Module ID:** `core/audit-log`
**Layer:** 1 (Core)
**Stability:** stable — every state-changing operation depends on this module.

---

## Purpose

Provide the production `AuditSink` implementation that every component uses to record state changes, plus the query operations that power the audit trail UI.

## Business problem solved

Per `ai-instructions/architecture-rules.md` §1 (Core capabilities — Audit logs) and `security-rules.md` §5 (Clinics — strict access logging), the platform must keep an immutable record of every state-changing operation. Without a central audit module, every component would either skip auditing or invent its own format — neither is acceptable for sensitive data.

This module centralizes auditing:
- **`PersistentAuditSink`** — the production `AuditSink` that writes to the audit store. Components accept an `AuditSink` through dependency injection; in tests they use `InMemoryAuditSink`, in production they use this class.
- **Query operations** — list, count, and filter entries, scoped to a tenant.
- **Immutability** — the store interface has no `update` or `delete` methods. Once recorded, an entry cannot be modified.

## Features

- Record audit entries (via `PersistentAuditSink` or `recordAuditEntry` directly)
- Query the audit log with filters (component, action, entity, actor, date range)
- Count matching entries (for dashboards)
- Cursor-based pagination
- Per-tenant isolation enforced (no cross-tenant queries possible)
- Immutable — no update or delete operations

## Dependencies

- `@business-os/shared` — `AuditEntry`, `AuditSink`, `TenantId`, `createAuditEntry`.

## Configuration options

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultPageSize` | `number` | `100` | Default entries per page. |
| `maxPageSize` | `number` | `500` | Maximum entries per page a caller can request. |

## Permissions required

- `audit.read` — to query the audit log

## Data handled

- **Audit entries** — actor, action, entity, timestamp, structured details.
- **Tenant-scoped** — every entry belongs to a tenant; queries are scoped to a tenant.

Sensitive. Audit entries may reference underlying sensitive data (a patient record id, a payment amount). The audit log itself must be access-controlled — only roles with `audit.read` can query it.

## Retention

Audit entries are retained for **7 years** by default (`AUDIT_LOG_RETENTION_DAYS` in `database/schema.ts`). This is a conservative default appropriate for medical data per `security-rules.md` §5. A future retention job (in `core/scheduler`) will archive entries older than the retention window to cold storage.

## API interfaces

See `api/contract.ts` for the HTTP routes.

## Limitations

- **In-memory store only.** The `InMemoryAuditLogStore` is for tests and early development. A Postgres adapter is the next step — and it must enforce append-only at the database level (via triggers or row-level security).
- **No streaming.** Entries are polled, not streamed.
- **No export to CSV/JSON.** A future version will add export for compliance audits.

## Future improvements

- Postgres adapter with append-only enforcement.
- Streaming via WebSocket for real-time audit dashboards.
- CSV/JSON export for compliance audits.
- Anomaly detection (unusual access patterns).
- Cross-tenant audit queries for platform-level administrators (with strict additional controls).
