-- Schema for cross-cutting components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- activity-timeline
-- ============================================================
CREATE TABLE IF NOT EXISTS activity_timeline_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  summary TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_activity_timeline_events_tenant ON activity_timeline_events(tenant_id);

-- ============================================================
-- document-management
-- ============================================================
CREATE TABLE IF NOT EXISTS document_documents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  storage_key TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_document_documents_tenant ON document_documents(tenant_id);

-- ============================================================
-- forms-and-intake
-- ============================================================
CREATE TABLE IF NOT EXISTS forms_form_definitions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  fields_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_forms_form_definitions_tenant ON forms_form_definitions(tenant_id);

CREATE TABLE IF NOT EXISTS forms_form_submissions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  form_id TEXT NOT NULL,
  values_json TEXT NOT NULL,
  submitted_by_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_forms_form_submissions_tenant ON forms_form_submissions(tenant_id);

-- ============================================================
-- messaging-center
-- ============================================================
CREATE TABLE IF NOT EXISTS messaging_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  channel TEXT NOT NULL,
  template_key TEXT NOT NULL,
  variables TEXT,
  status TEXT NOT NULL,
  sent_at TEXT,
  delivered_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_messaging_messages_tenant ON messaging_messages(tenant_id);

-- ============================================================
-- notes-and-comments
-- ============================================================
CREATE TABLE IF NOT EXISTS notes_notes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  body TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  parent_id TEXT,
  visibility TEXT NOT NULL,
  edited_at TEXT,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notes_notes_tenant ON notes_notes(tenant_id);

-- ============================================================
-- notifications-center
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications_notifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  recipient_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  action_label TEXT,
  action_url TEXT,
  read_at TEXT,
  dismissed_at TEXT,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_notifications_tenant ON notifications_notifications(tenant_id);

-- ============================================================
-- payments-or-collections
-- ============================================================
CREATE TABLE IF NOT EXISTS payments_payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL,
  method TEXT NOT NULL,
  provider_reference TEXT,
  invoice_id TEXT,
  payer_name TEXT,
  status TEXT NOT NULL,
  refunded_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_payments_tenant ON payments_payments(tenant_id);

-- ============================================================
-- reporting-dashboard
-- ============================================================
CREATE TABLE IF NOT EXISTS reporting_metrics (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  key TEXT NOT NULL,
  name TEXT NOT NULL,
  source_query TEXT NOT NULL,
  refresh_interval_seconds INTEGER NOT NULL,
  owner_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reporting_metrics_tenant ON reporting_metrics(tenant_id);

CREATE TABLE IF NOT EXISTS reporting_metric_values (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  metric_key TEXT NOT NULL,
  computed_at TEXT NOT NULL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  value INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reporting_metric_values_tenant ON reporting_metric_values(tenant_id);

-- ============================================================
-- roles-and-permissions-ui
-- ============================================================
CREATE TABLE IF NOT EXISTS roles_role_definitions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  permissions_json TEXT NOT NULL,
  is_system INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_roles_role_definitions_tenant ON roles_role_definitions(tenant_id);

-- ============================================================
-- search-and-filter
-- ============================================================
CREATE TABLE IF NOT EXISTS search_saved_queries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  query_text TEXT,
  filters_json TEXT,
  sort_field TEXT,
  sort_direction TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_search_saved_queries_tenant ON search_saved_queries(tenant_id);
