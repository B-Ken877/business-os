# API Contract — `retail-stock-alerts`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `evaluateStockLevel`

**Permission required:** `retail.stockalerts.evaluate`

**Description:** Evaluate a single product's stock level and emit an alert if it has crossed a threshold. Suppresses duplicates within the configured window.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | `string` | yes |  |
| `currentQuantity` | `number` | yes |  |
| `threshold` | `number` | yes |  |

**Returns:** `Result<StockAlert | null>`

**Audit:** emits an entry with action `retail.stockalert.emitted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listActiveAlerts`

**Permission required:** `retail.stockalerts.read`

**Description:** List all alerts emitted in the last 24 hours, newest first.

**Input:** none.

**Returns:** `Result<readonly StockAlert[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
