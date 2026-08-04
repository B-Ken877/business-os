# API Contract — `clinic-prescriptions`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createPrescription`

**Permission required:** `clinic.prescriptions.create`

**Description:** Create a new prescription.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `doctorStaffId` | `string` | yes |  |
| `medicationName` | `string` | yes |  |
| `dosage` | `string` | yes |  |
| `durationDays` | `number` | yes |  |
| `refillsRemaining` | `number` | yes |  |
| `medicalRecordId` | `string` | no |  |

**Returns:** `Result<Prescription>`

**Audit:** emits an entry with action `clinic.prescription.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `refillPrescription`

**Permission required:** `clinic.prescriptions.refill`

**Description:** Refill a prescription. Decrements refillsRemaining; deactivates when 0.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `prescriptionId` | `string` | yes |  |

**Returns:** `Result<Prescription>`

**Audit:** emits an entry with action `clinic.prescription.refilled`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
