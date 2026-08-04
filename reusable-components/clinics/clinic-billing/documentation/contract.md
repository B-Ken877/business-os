# API Contract — `clinic-billing`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `generateInvoice`

**Permission required:** `clinic.billing.generate`

**Description:** Generate an invoice for a patient visit.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `amountCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `appointmentId` | `string` | no |  |

**Returns:** `Result<Invoice>`

**Audit:** emits an entry with action `clinic.invoice.generated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markInvoicePaid`

**Permission required:** `clinic.billing.record_payment`

**Description:** Mark an invoice as paid.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `invoiceId` | `string` | yes |  |

**Returns:** `Result<Invoice>`

**Audit:** emits an entry with action `clinic.invoice.paid`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
