-- Schema for the core layer, SQLite dialect.
-- Run on startup by the persistence adapter. All statements use
-- CREATE TABLE IF NOT EXISTS so re-running is safe.
--
-- Per ai-instructions/security-rules.md §3 (Tenant boundaries):
-- every tenant-scoped table has a tenant_id column and an index on it.
-- The application layer enforces scoping; the DB indexes support it.

-- ============================================================
-- core/identity
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  last_login_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  cost_n INTEGER NOT NULL,
  block_size_r INTEGER NOT NULL,
  parallelization_p INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  created_by_ip TEXT,
  created_by_user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- core/organizations
-- ============================================================

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  industry TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(organization_id, user_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_user_id ON memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_id ON memberships(organization_id);

CREATE TABLE IF NOT EXISTS invitations (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TEXT NOT NULL,
  invited_by_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE INDEX IF NOT EXISTS idx_invitations_org_id ON invitations(organization_id);

-- ============================================================
-- core/authorization
-- ============================================================

CREATE TABLE IF NOT EXISTS role_definitions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  permissions TEXT NOT NULL DEFAULT '[]', -- JSON array
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(tenant_id, name),
  FOREIGN KEY (tenant_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS role_grants (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(tenant_id, user_id, role_name),
  FOREIGN KEY (tenant_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_grants_tenant_user ON role_grants(tenant_id, user_id);

-- ============================================================
-- core/audit-log
-- Per security-rules.md §5 (Clinics — strict access logging),
-- audit entries are APPEND-ONLY. There is no UPDATE or DELETE
-- statement anywhere in the codebase for this table. A future
-- retention job will archive old entries to cold storage.
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  at TEXT NOT NULL,
  component_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '{}' -- JSON object
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant_at ON audit_log(tenant_id, at);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_entity ON audit_log(tenant_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_actor ON audit_log(tenant_id, actor_user_id, at);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_component ON audit_log(tenant_id, component_id, at);
