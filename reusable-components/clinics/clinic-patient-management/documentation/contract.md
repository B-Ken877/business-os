# API Contract — `clinic-patient-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createPatient`

**Permission required:** `clinic.patients.create`

**Description:** Create a new patient record. The medicalRecordNumber must be unique per tenant.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | `string` | yes |  |
| `lastName` | `string` | yes |  |
| `dateOfBirth` | `string` | yes |  |
| `medicalRecordNumber` | `string` | yes |  |
| `phone` | `string` | no |  |
| `email` | `string` | no |  |
| `address` | `string` | no |  |

**Returns:** `Result<Patient>`

**Audit:** emits an entry with action `clinic.patient.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `getPatient`

**Permission required:** `clinic.patients.read`

**Description:** Retrieve a patient by id. Every read is audited — see security-rules.md §5.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |

**Returns:** `Result<Patient>`

**Audit:** emits an entry with action `clinic.patient.read`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
