# API Contract — `payments-or-collections`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordPayment`

**Permission required:** `payments.record`

**Description:** Record a payment received.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `amount` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `method` | `string` | yes |  |
| `providerReference` | `string` | no |  |
| `invoiceId` | `string` | no |  |
| `payerName` | `string` | no |  |

**Returns:** `Result<Payment>`

**Audit:** emits an entry with action `payment.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `refundPayment`

**Permission required:** `payments.refund`

**Description:** Mark a previously recorded payment as refunded. The actual refund is initiated through the payment provider; this records the result.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `paymentId` | `string` | yes |  |
| `reason` | `string` | yes |  |

**Returns:** `Result<Payment>`

**Audit:** emits an entry with action `payment.refunded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listPaymentsForInvoice`

**Permission required:** `payments.read`

**Description:** List all non-refunded payments attached to an invoice.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `invoiceId` | `string` | yes |  |

**Returns:** `Result<readonly Payment[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
