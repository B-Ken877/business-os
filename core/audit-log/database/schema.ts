import type { AuditEntry, TenantId } from "@business-os/shared";

/**
 * The audit log row. Mirrors the AuditEntry type from @business-os/shared
 * but with snake_case column names for the database.
 *
 * Audit rows are APPEND-ONLY — there is no UPDATE or DELETE. The database
 * adapter must enforce this (e.g. via triggers or row-level permissions).
 */
export interface AuditLogRow {
  readonly id: string;
  readonly tenant_id: TenantId;
  readonly actor_user_id: string;
  readonly at: string;
  readonly component_id: string;
  readonly action: string;
  readonly entity_type: string;
  readonly entity_id: string;
  /** JSON-serialised details object. */
  readonly details: string;
}

export const recommendedIndexes = [
  { table: "AuditLogRow", columns: ["id"], unique: true },
  { table: "AuditLogRow", columns: ["tenant_id", "at"], unique: false },
  { table: "AuditLogRow", columns: ["tenant_id", "entity_type", "entity_id"], unique: false },
  { table: "AuditLogRow", columns: ["tenant_id", "actor_user_id", "at"], unique: false },
  { table: "AuditLogRow", columns: ["tenant_id", "component_id", "at"], unique: false },
] as const;

/**
 * Retention policy: audit entries are kept for this many days before being
 * archived to cold storage. The platform's retention job (a future
 * core/scheduler module) handles archival.
 */
export const AUDIT_LOG_RETENTION_DAYS = 365 * 7; // 7 years — conservative default for medical data
