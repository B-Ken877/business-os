# API Contract — `church-groups`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createGroup`

**Permission required:** `church.groups.manage`

**Description:** Create a new group.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `leaderMemberId` | `string` | yes |  |
| `maxMembers` | `number` | yes |  |

**Returns:** `Result<Group>`

**Audit:** emits an entry with action `church.group.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `joinGroup`

**Permission required:** `church.groups.join`

**Description:** Add a member to a group. Enforces max members.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `groupId` | `string` | yes |  |
| `memberId` | `string` | yes |  |

**Returns:** `Result<GroupMembership>`

**Audit:** emits an entry with action `church.group.joined`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
