# API Contract — `messaging-center`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `sendMessage`

**Permission required:** `messaging.messages.send`

**Description:** Send a message to a single recipient through a channel.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `recipientId` | `string` | yes |  |
| `channel` | `string` | yes |  |
| `templateKey` | `string` | yes |  |
| `body` | `string` | yes | Rendered message body (caller is responsible for template substitution). |

**Returns:** `Result<Message>`

**Audit:** emits an entry with action `messaging.message.sent`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markDelivered`

**Permission required:** `messaging.messages.read`

**Description:** Mark a queued or sent message as delivered. Called by the channel adapter on delivery confirmation.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `messageId` | `string` | yes |  |

**Returns:** `Result<Message>`

**Audit:** emits an entry with action `messaging.message.delivered`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listMessages`

**Permission required:** `messaging.messages.read`

**Description:** List all messages for the current tenant, newest first.

**Input:** none.

**Returns:** `Result<readonly Message[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
