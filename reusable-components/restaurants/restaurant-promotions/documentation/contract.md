# API Contract — `restaurant-promotions`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createCoupon`

**Permission required:** `restaurant.promotions.manage`

**Description:** Create a new coupon.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | yes |  |
| `discountType` | `string` | yes |  |
| `discountValue` | `number` | yes |  |
| `maxRedemptions` | `number` | yes |  |

**Returns:** `Result<Coupon>`

**Audit:** emits an entry with action `restaurant.coupon.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `redeemCoupon`

**Permission required:** `restaurant.promotions.redeem`

**Description:** Redeem a coupon. Increments the redemption count and enforces the max.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `code` | `string` | yes |  |

**Returns:** `Result<Coupon>`

**Audit:** emits an entry with action `restaurant.coupon.redeemed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
