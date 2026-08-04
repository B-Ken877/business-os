# API Contract — `clinic-lab-orders`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `orderLabTest`

**Permission required:** `clinic.lab.order`

**Description:** Order a lab test for a patient.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `doctorStaffId` | `string` | yes |  |
| `testName` | `string` | yes |  |

**Returns:** `Result<LabOrder>`

**Audit:** emits an entry with action `clinic.lab.ordered`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `recordResult`

**Permission required:** `clinic.lab.record_result`

**Description:** Record a result document for a lab order. Marks the order as completed.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `labOrderId` | `string` | yes |  |
| `resultDocumentId` | `string` | yes |  |

**Returns:** `Result<LabOrder>`

**Audit:** emits an entry with action `clinic.lab.result_recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
