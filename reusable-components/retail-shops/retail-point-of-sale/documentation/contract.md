# API Contract — `retail-point-of-sale`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `checkout`

**Permission required:** `retail.pos.checkout`

**Description:** Process a cart: compute totals, record payment, decrement stock, and create a Sale record.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `itemsJson` | `string` | yes | JSON array of { productId, quantity, unitPriceCents }. |
| `discountCents` | `number` | yes |  |
| `paymentMethod` | `string` | yes |  |
| `paymentReference` | `string` | no |  |

**Returns:** `Result<Sale>`

**Audit:** emits an entry with action `retail.sale.completed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `getSale`

**Permission required:** `retail.pos.read`

**Description:** Retrieve a sale by id.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `saleId` | `string` | yes |  |

**Returns:** `Result<Sale>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
