# API Contract — `church-sermons`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordSermon`

**Permission required:** `church.sermons.manage`

**Description:** Record a new sermon.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | yes |  |
| `speakerMemberId` | `string` | yes |  |
| `deliveredAt` | `string` | yes |  |
| `scriptureReferences` | `string` | no |  |
| `seriesId` | `string` | no |  |

**Returns:** `Result<Sermon>`

**Audit:** emits an entry with action `church.sermon.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listSermonsBySpeaker`

**Permission required:** `church.sermons.read`

**Description:** List all sermons by a given speaker, newest first.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `speakerMemberId` | `string` | yes |  |

**Returns:** `Result<readonly Sermon[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
