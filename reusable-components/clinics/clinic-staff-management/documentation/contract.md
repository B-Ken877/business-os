# API Contract — `clinic-staff-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createStaff`

**Permission required:** `clinic.staff.manage`

**Description:** Create a new staff record.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `firstName` | `string` | yes |  |
| `lastName` | `string` | yes |  |
| `role` | `string` | yes |  |
| `specialty` | `string` | no |  |
| `phone` | `string` | no |  |
| `email` | `string` | no |  |

**Returns:** `Result<Staff>`

**Audit:** emits an entry with action `clinic.staff.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listDoctors`

**Permission required:** `clinic.staff.read`

**Description:** List all staff with the 'doctor' role.

**Input:** none.

**Returns:** `Result<readonly Staff[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
