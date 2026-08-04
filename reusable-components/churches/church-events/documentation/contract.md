# API Contract — `church-events`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createEvent`

**Permission required:** `church.events.manage`

**Description:** Create a new event.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `startsAt` | `string` | yes |  |
| `endsAt` | `string` | yes |  |
| `location` | `string` | no |  |
| `capacity` | `number` | yes |  |

**Returns:** `Result<Event>`

**Audit:** emits an entry with action `church.event.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `registerForMember`

**Permission required:** `church.events.register`

**Description:** Register a member for an event. Enforces capacity.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `eventId` | `string` | yes |  |
| `memberId` | `string` | yes |  |

**Returns:** `Result<EventRegistration>`

**Audit:** emits an entry with action `church.event.registered`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
