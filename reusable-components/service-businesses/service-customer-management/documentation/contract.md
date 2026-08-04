# API Contract — `service-customer-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createCustomer`

**Permission required:** `service.customers.create`

**Description:** Create a new customer.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `phone` | `string` | no |  |
| `email` | `string` | no |  |
| `address` | `string` | no |  |

**Returns:** `Result<Customer>`

**Audit:** emits an entry with action `service.customer.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `setPreferences`

**Permission required:** `service.customers.update`

**Description:** Set the customer's preferences JSON.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `preferencesJson` | `string` | yes |  |

**Returns:** `Result<Customer>`

**Audit:** emits an entry with action `service.customer.preferences_set`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
