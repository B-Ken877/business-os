# API Contract — `church-volunteers`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createVolunteer`

**Permission required:** `church.volunteers.manage`

**Description:** Create a volunteer record for a member.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | `string` | yes |  |
| `role` | `string` | yes |  |

**Returns:** `Result<Volunteer>`

**Audit:** emits an entry with action `church.volunteer.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `assignVolunteer`

**Permission required:** `church.volunteers.manage`

**Description:** Assign a volunteer to an event or ministry. Enforces the max-assignments cap.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `volunteerId` | `string` | yes |  |
| `assignmentType` | `string` | yes |  |
| `assignmentId` | `string` | yes |  |

**Returns:** `Result<VolunteerAssignment>`

**Audit:** emits an entry with action `church.volunteer.assigned`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
