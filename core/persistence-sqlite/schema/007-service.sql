-- Schema for service-businesses components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- service-booking
-- ============================================================
CREATE TABLE IF NOT EXISTS service_bookings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  service_id TEXT NOT NULL,
  staff_user_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_bookings_tenant ON service_bookings(tenant_id);

-- ============================================================
-- service-catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS service_services (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_services_tenant ON service_services(tenant_id);

-- ============================================================
-- service-customer-management
-- ============================================================
CREATE TABLE IF NOT EXISTS service_customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  preferences_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_customers_tenant ON service_customers(tenant_id);

-- ============================================================
-- service-feedback
-- ============================================================
CREATE TABLE IF NOT EXISTS service_feedbacks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  booking_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_feedbacks_tenant ON service_feedbacks(tenant_id);

-- ============================================================
-- service-invoicing
-- ============================================================
CREATE TABLE IF NOT EXISTS service_invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  booking_id TEXT,
  job_id TEXT,
  subtotal_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_invoices_tenant ON service_invoices(tenant_id);

-- ============================================================
-- service-job-tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS service_jobs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  booking_id TEXT,
  customer_id TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_jobs_tenant ON service_jobs(tenant_id);

CREATE TABLE IF NOT EXISTS service_job_tasks (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  job_id TEXT NOT NULL,
  title TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_job_tasks_tenant ON service_job_tasks(tenant_id);

-- ============================================================
-- service-quotes
-- ============================================================
CREATE TABLE IF NOT EXISTS service_quotes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  items_json TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_quotes_tenant ON service_quotes(tenant_id);

-- ============================================================
-- service-scheduling
-- ============================================================
CREATE TABLE IF NOT EXISTS service_staff_availabilities (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  staff_user_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_hour INTEGER NOT NULL,
  end_hour INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_staff_availabilities_tenant ON service_staff_availabilities(tenant_id);

CREATE TABLE IF NOT EXISTS service_time_offs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  staff_user_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_service_time_offs_tenant ON service_time_offs(tenant_id);
