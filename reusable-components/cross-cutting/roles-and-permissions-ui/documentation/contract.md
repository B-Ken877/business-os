# API Contract — `roles-and-permissions-ui`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `defineRole`

**Permission required:** `roles.manage`

**Description:** Define a new role for the tenant.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `description` | `string` | no |  |
| `permissionsJson` | `string` | yes |  |

**Returns:** `Result<RoleDefinition>`

**Audit:** emits an entry with action `role.defined`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listRoles`

**Permission required:** `roles.read`

**Description:** List all roles defined in the tenant.

**Input:** none.

**Returns:** `Result<readonly RoleDefinition[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listPermissionsForRole`

**Permission required:** `permissions.read`

**Description:** Return the parsed permission list for a role.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `roleName` | `string` | yes |  |

**Returns:** `Result<ReadonlyArray<string>>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
