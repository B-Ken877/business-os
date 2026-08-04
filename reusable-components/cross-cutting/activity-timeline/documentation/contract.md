# API Contract — `activity-timeline`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordEvent`

**Permission required:** `timeline.events.record`

**Description:** Record an event for an entity. Events are immutable once recorded.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `entityType` | `string` | yes |  |
| `entityId` | `string` | yes |  |
| `action` | `string` | yes |  |
| `summary` | `string` | yes |  |
| `occurredAt` | `string` | yes |  |

**Returns:** `Result<TimelineEvent>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listEventsForEntity`

**Permission required:** `timeline.events.read`

**Description:** List all events for an entity, newest first.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `entityType` | `string` | yes |  |
| `entityId` | `string` | yes |  |

**Returns:** `Result<readonly TimelineEvent[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
