# API Contract — `notes-and-comments`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createNote`

**Permission required:** `notes.create`

**Description:** Create a new note attached to an entity.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `body` | `string` | yes |  |
| `entityType` | `string` | yes |  |
| `entityId` | `string` | yes |  |
| `parentId` | `string` | no |  |
| `visibility` | `string` | yes |  |

**Returns:** `Result<Note>`

**Audit:** emits an entry with action `note.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listNotesForEntity`

**Permission required:** `notes.read`

**Description:** List all non-deleted notes attached to an entity.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `entityType` | `string` | yes |  |
| `entityId` | `string` | yes |  |

**Returns:** `Result<readonly Note[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `deleteNote`

**Permission required:** `notes.delete`

**Description:** Soft-delete a note. Replies are not auto-deleted; they reference a deleted parent.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `noteId` | `string` | yes |  |

**Returns:** `Result<Note>`

**Audit:** emits an entry with action `note.deleted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
