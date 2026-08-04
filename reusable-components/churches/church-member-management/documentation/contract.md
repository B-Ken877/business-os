# API Contract — `church-member-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createMember`

**Permission required:** `church.members.manage`

**Description:** Create a new member record.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | `string` | yes |  |
| `lastName` | `string` | yes |  |
| `phone` | `string` | no |  |
| `email` | `string` | no |  |
| `familyId` | `string` | no |  |
| `directoryVisibility` | `string` | yes |  |

**Returns:** `Result<Member>`

**Audit:** emits an entry with action `church.member.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listVisibleMembers`

**Permission required:** `church.members.read`

**Description:** List all members whose directory visibility is 'visible' and whose status is 'active'.

**Input:** none.

**Returns:** `Result<readonly Member[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `updateOwnVisibility`

**Permission required:** `church.members.update_own`

**Description:** A member updates their own directory visibility. The caller's userId must match the member's id (enforced by the orchestrator).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | `string` | yes |  |
| `visibility` | `string` | yes |  |

**Returns:** `Result<Member>`

**Audit:** emits an entry with action `church.member.visibility_updated`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
