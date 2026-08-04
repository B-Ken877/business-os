# API Contract — `document-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `uploadDocument`

**Permission required:** `documents.upload`

**Description:** Register an uploaded file. The actual bytes are assumed to be already stored by the platform's storage adapter; this operation records the metadata.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `fileName` | `string` | yes |  |
| `mimeType` | `string` | yes |  |
| `sizeBytes` | `number` | yes |  |
| `storageKey` | `string` | yes |  |
| `entityType` | `string` | yes |  |
| `entityId` | `string` | yes |  |
| `kind` | `string` | yes |  |

**Returns:** `Result<Document>`

**Audit:** emits an entry with action `document.uploaded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listDocumentsForEntity`

**Permission required:** `documents.read`

**Description:** List all non-deleted documents attached to a specific entity.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `entityType` | `string` | yes |  |
| `entityId` | `string` | yes |  |

**Returns:** `Result<readonly Document[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `softDeleteDocument`

**Permission required:** `documents.delete`

**Description:** Mark a document as soft-deleted. The bytes are retained until the retention window expires.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `documentId` | `string` | yes |  |

**Returns:** `Result<Document>`

**Audit:** emits an entry with action `document.soft_deleted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
