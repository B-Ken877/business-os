# API Contract — `clinic-medical-records`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createRecord`

**Permission required:** `clinic.records.create`

**Description:** Create a new medical record entry.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `doctorStaffId` | `string` | yes |  |
| `consultationNotes` | `string` | yes |  |
| `diagnosis` | `string` | no |  |
| `treatmentPlan` | `string` | no |  |
| `appointmentId` | `string` | no |  |

**Returns:** `Result<MedicalRecord>`

**Audit:** emits an entry with action `clinic.record.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listRecordsForPatient`

**Permission required:** `clinic.records.read`

**Description:** List all medical records for a patient. Every list call is audited.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |

**Returns:** `Result<readonly MedicalRecord[]>`

**Audit:** emits an entry with action `clinic.records.listed_for_patient`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
