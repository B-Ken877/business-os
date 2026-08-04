# API Contract — `service-quotes`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createQuote`

**Permission required:** `service.quotes.create`

**Description:** Create a new quote in draft status.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerName` | `string` | yes |  |
| `customerPhone` | `string` | no |  |
| `itemsJson` | `string` | yes |  |
| `totalCents` | `number` | yes |  |
| `currency` | `string` | yes |  |

**Returns:** `Result<Quote>`

**Audit:** emits an entry with action `service.quote.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `approveQuote`

**Permission required:** `service.quotes.approve`

**Description:** Approve a quote. Only drafts can be approved.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `quoteId` | `string` | yes |  |

**Returns:** `Result<Quote>`

**Audit:** emits an entry with action `service.quote.approved`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
