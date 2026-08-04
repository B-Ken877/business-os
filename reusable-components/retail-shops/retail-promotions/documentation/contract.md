# API Contract — `retail-promotions`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createPromotion`

**Permission required:** `retail.promotions.create`

**Description:** Create a new promotion in draft status.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `discountType` | `string` | yes |  |
| `discountValue` | `number` | yes |  |
| `scopeJson` | `string` | yes |  |
| `startsAt` | `string` | yes |  |
| `endsAt` | `string` | yes |  |

**Returns:** `Result<Promotion>`

**Audit:** emits an entry with action `retail.promotion.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `activatePromotion`

**Permission required:** `retail.promotions.activate`

**Description:** Activate a draft promotion. Enforces the active-promotion cap.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `promotionId` | `string` | yes |  |

**Returns:** `Result<Promotion>`

**Audit:** emits an entry with action `retail.promotion.activated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listActivePromotions`

**Permission required:** `retail.promotions.read`

**Description:** List all currently active promotions (status=active and within date range).

**Input:** none.

**Returns:** `Result<readonly Promotion[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
