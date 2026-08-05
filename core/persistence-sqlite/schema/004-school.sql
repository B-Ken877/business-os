-- Schema for schools components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- school-attendance
-- ============================================================
CREATE TABLE IF NOT EXISTS school_attendance_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  session_date TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_attendance_records_tenant ON school_attendance_records(tenant_id);

-- ============================================================
-- school-certificates
-- ============================================================
CREATE TABLE IF NOT EXISTS school_certificates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  program_name TEXT NOT NULL,
  certificate_number TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  pdf_document_id TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_certificates_tenant ON school_certificates(tenant_id);

-- ============================================================
-- school-class-scheduling
-- ============================================================
CREATE TABLE IF NOT EXISTS school_class_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  teacher_user_id TEXT NOT NULL,
  room_id TEXT NOT NULL,
  day_of_week INTEGER NOT NULL,
  start_hour INTEGER NOT NULL,
  start_minute INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_class_sessions_tenant ON school_class_sessions(tenant_id);

-- ============================================================
-- school-exams
-- ============================================================
CREATE TABLE IF NOT EXISTS school_exams (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_exams_tenant ON school_exams(tenant_id);

-- ============================================================
-- school-grading
-- ============================================================
CREATE TABLE IF NOT EXISTS school_grades (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  assessment_id TEXT NOT NULL,
  score_pct INTEGER NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_grades_tenant ON school_grades(tenant_id);

CREATE TABLE IF NOT EXISTS school_assessments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  max_score_pct INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_assessments_tenant ON school_assessments(tenant_id);

-- ============================================================
-- school-parent-communication
-- ============================================================
CREATE TABLE IF NOT EXISTS school_parent_messages (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  direction TEXT NOT NULL,
  messaging_message_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_parent_messages_tenant ON school_parent_messages(tenant_id);

-- ============================================================
-- school-student-enrollment
-- ============================================================
CREATE TABLE IF NOT EXISTS school_students (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  guardian_name TEXT NOT NULL,
  guardian_phone TEXT,
  enrollment_status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_students_tenant ON school_students(tenant_id);

-- ============================================================
-- school-student-portal
-- ============================================================
CREATE TABLE IF NOT EXISTS school_student_portal_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_student_portal_sessions_tenant ON school_student_portal_sessions(tenant_id);

-- ============================================================
-- school-teacher-management
-- ============================================================
CREATE TABLE IF NOT EXISTS school_teachers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  subjects_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_teachers_tenant ON school_teachers(tenant_id);

-- ============================================================
-- school-tuition-management
-- ============================================================
CREATE TABLE IF NOT EXISTS school_tuition_plans (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  total_amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  installments_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_tuition_plans_tenant ON school_tuition_plans(tenant_id);

CREATE TABLE IF NOT EXISTS school_tuition_payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  payment_reference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_school_tuition_payments_tenant ON school_tuition_payments(tenant_id);
