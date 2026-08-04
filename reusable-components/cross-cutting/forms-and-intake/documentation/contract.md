# API Contract — `forms-and-intake`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `defineForm`

**Permission required:** `forms.define`

**Description:** Define a new form.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `slug` | `string` | yes |  |
| `title` | `string` | yes |  |
| `fieldsJson` | `string` | yes |  |

**Returns:** `Result<FormDefinition>`

**Audit:** emits an entry with action `form.defined`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `publishForm`

**Permission required:** `forms.publish`

**Description:** Publish a draft form so it can accept submissions.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `formId` | `string` | yes |  |

**Returns:** `Result<FormDefinition>`

**Audit:** emits an entry with action `form.published`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `submitForm`

**Permission required:** `forms.submit`

**Description:** Submit values to a published form.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `formId` | `string` | yes |  |
| `valuesJson` | `string` | yes |  |

**Returns:** `Result<FormSubmission>`

**Audit:** emits an entry with action `form.submitted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
