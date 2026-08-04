# API Contract — `notifications-center`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `pushNotification`

**Permission required:** `notifications.push`

**Description:** Push a notification to a user's inbox.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `recipientUserId` | `string` | yes |  |
| `title` | `string` | yes |  |
| `body` | `string` | yes |  |
| `actionLabel` | `string` | no |  |
| `actionUrl` | `string` | no |  |

**Returns:** `Result<Notification>`

**Audit:** emits an entry with action `notification.pushed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listUnreadForCurrentUser`

**Permission required:** `notifications.read`

**Description:** List all unread, non-expired, non-dismissed notifications for the current user.

**Input:** none.

**Returns:** `Result<readonly Notification[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `markRead`

**Permission required:** `notifications.read`

**Description:** Mark a notification as read.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `notificationId` | `string` | yes |  |

**Returns:** `Result<Notification>`

**Audit:** emits an entry with action `notification.read`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
