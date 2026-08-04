# API Contract — `church-announcements`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `publishAnnouncement`

**Permission required:** `church.announcements.publish`

**Description:** Publish a new announcement.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes |  |
| `body` | `string` | yes |  |
| `audience` | `string` | yes |  |

**Returns:** `Result<Announcement>`

**Audit:** emits an entry with action `church.announcement.published`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listActiveAnnouncements`

**Permission required:** `church.announcements.read`

**Description:** List all non-expired announcements for a given audience, newest first.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `audience` | `string` | yes |  |

**Returns:** `Result<readonly Announcement[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
