# API Contract — `restaurant-billing`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `generateBill`

**Permission required:** `restaurant.billing.generate`

**Description:** Generate a bill from one or more orders.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `orderIdsJson` | `string` | yes |  |
| `tipCents` | `number` | yes |  |

**Returns:** `Result<Bill>`

**Audit:** emits an entry with action `restaurant.bill.generated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markPaid`

**Permission required:** `restaurant.billing.record_payment`

**Description:** Mark a bill as paid after payment is recorded.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `billId` | `string` | yes |  |

**Returns:** `Result<Bill>`

**Audit:** emits an entry with action `restaurant.bill.paid`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
