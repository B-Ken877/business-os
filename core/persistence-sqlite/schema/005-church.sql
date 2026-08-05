-- Schema for churches components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- church-announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS church_announcements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_announcements_tenant ON church_announcements(tenant_id);

-- ============================================================
-- church-attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS church_service_attendances (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  service_date TEXT NOT NULL,
  attended INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_service_attendances_tenant ON church_service_attendances(tenant_id);

-- ============================================================
-- church-donations
-- ============================================================
CREATE TABLE IF NOT EXISTS church_donations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  fund TEXT NOT NULL,
  method TEXT NOT NULL,
  payment_reference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_donations_tenant ON church_donations(tenant_id);

CREATE TABLE IF NOT EXISTS church_pledges (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  target_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  fund TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_pledges_tenant ON church_pledges(tenant_id);

-- ============================================================
-- church-events
-- ============================================================
CREATE TABLE IF NOT EXISTS church_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  location TEXT,
  capacity INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_events_tenant ON church_events(tenant_id);

CREATE TABLE IF NOT EXISTS church_event_registrations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  event_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_event_registrations_tenant ON church_event_registrations(tenant_id);

-- ============================================================
-- church-groups
-- ============================================================
CREATE TABLE IF NOT EXISTS church_groups (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  leader_member_id TEXT NOT NULL,
  max_members INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_groups_tenant ON church_groups(tenant_id);

CREATE TABLE IF NOT EXISTS church_group_memberships (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  group_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_group_memberships_tenant ON church_group_memberships(tenant_id);

-- ============================================================
-- church-member-management
-- ============================================================
CREATE TABLE IF NOT EXISTS church_members (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  family_id TEXT,
  membership_status TEXT NOT NULL,
  directory_visibility TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_members_tenant ON church_members(tenant_id);

-- ============================================================
-- church-sermons
-- ============================================================
CREATE TABLE IF NOT EXISTS church_sermons (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  title TEXT NOT NULL,
  speaker_member_id TEXT NOT NULL,
  delivered_at TEXT NOT NULL,
  scripture_references TEXT,
  series_id TEXT,
  audio_document_id TEXT,
  video_document_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_sermons_tenant ON church_sermons(tenant_id);

-- ============================================================
-- church-volunteers
-- ============================================================
CREATE TABLE IF NOT EXISTS church_volunteers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_volunteers_tenant ON church_volunteers(tenant_id);

CREATE TABLE IF NOT EXISTS church_volunteer_assignments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  volunteer_id TEXT NOT NULL,
  assignment_type TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_church_volunteer_assignments_tenant ON church_volunteer_assignments(tenant_id);
