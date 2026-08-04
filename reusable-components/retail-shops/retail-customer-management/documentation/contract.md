# API Contract — `retail-customer-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createCustomer`

**Permission required:** `retail.customers.create`

**Description:** Create a new customer record.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `phone` | `string` | no |  |
| `email` | `string` | no |  |
| `address` | `string` | no |  |

**Returns:** `Result<Customer>`

**Audit:** emits an entry with action `retail.customer.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `updateStatus`

**Permission required:** `retail.customers.update`

**Description:** Update a customer's status (active, vip, blacklisted).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `newStatus` | `string` | yes |  |

**Returns:** `Result<Customer>`

**Audit:** emits an entry with action `retail.customer.status_updated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `addLoyaltyNote`

**Permission required:** `retail.customers.update`

**Description:** Append a loyalty note to a customer's record. Existing notes are preserved.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `note` | `string` | yes |  |

**Returns:** `Result<Customer>`

**Audit:** emits an entry with action `retail.customer.loyalty_note_added`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
