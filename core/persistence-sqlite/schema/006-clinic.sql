-- Schema for clinics components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- clinic-appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_appointments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  doctor_staff_id TEXT NOT NULL,
  scheduled_at TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  reason TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_appointments_tenant ON clinic_appointments(tenant_id);

-- ============================================================
-- clinic-billing
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  appointment_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_invoices_tenant ON clinic_invoices(tenant_id);

-- ============================================================
-- clinic-consent
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_consent_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  purpose TEXT NOT NULL,
  granted_at TEXT NOT NULL,
  revoked_at TEXT,
  revoke_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_consent_records_tenant ON clinic_consent_records(tenant_id);

-- ============================================================
-- clinic-lab-orders
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_lab_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  doctor_staff_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  result_document_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_lab_orders_tenant ON clinic_lab_orders(tenant_id);

-- ============================================================
-- clinic-medical-records
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_medical_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  doctor_staff_id TEXT NOT NULL,
  appointment_id TEXT,
  consultation_notes TEXT NOT NULL,
  diagnosis TEXT,
  treatment_plan TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_medical_records_tenant ON clinic_medical_records(tenant_id);

-- ============================================================
-- clinic-patient-management
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_patients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  medical_record_number TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_patients_tenant ON clinic_patients(tenant_id);

-- ============================================================
-- clinic-prescriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_prescriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  doctor_staff_id TEXT NOT NULL,
  medical_record_id TEXT,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  refills_remaining INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_prescriptions_tenant ON clinic_prescriptions(tenant_id);

-- ============================================================
-- clinic-reminders
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_reminders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  reminder_type TEXT NOT NULL,
  scheduled_for TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_reminders_tenant ON clinic_reminders(tenant_id);

-- ============================================================
-- clinic-staff-management
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_staffs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  email TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_staffs_tenant ON clinic_staffs(tenant_id);

-- ============================================================
-- clinic-triage
-- ============================================================
CREATE TABLE IF NOT EXISTS clinic_triage_entries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  visit_reason TEXT NOT NULL,
  symptoms_json TEXT,
  urgency TEXT NOT NULL,
  classified_by_staff_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_clinic_triage_entries_tenant ON clinic_triage_entries(tenant_id);
