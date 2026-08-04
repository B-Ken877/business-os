# API Contract — `service-invoicing`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `generateInvoice`

**Permission required:** `service.invoicing.generate`

**Description:** Generate an invoice.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `subtotalCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `bookingId` | `string` | no |  |
| `jobId` | `string` | no |  |

**Returns:** `Result<Invoice>`

**Audit:** emits an entry with action `service.invoice.generated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markPaid`

**Permission required:** `service.invoicing.record_payment`

**Description:** Mark an invoice as paid.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `invoiceId` | `string` | yes |  |

**Returns:** `Result<Invoice>`

**Audit:** emits an entry with action `service.invoice.paid`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
