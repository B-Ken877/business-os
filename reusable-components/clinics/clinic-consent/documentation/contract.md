# API Contract — `clinic-consent`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `grantConsent`

**Permission required:** `clinic.consent.manage`

**Description:** Grant consent for a specific purpose. Idempotent: re-granting active consent is a no-op.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `purpose` | `string` | yes |  |

**Returns:** `Result<ConsentRecord>`

**Audit:** emits an entry with action `clinic.consent.granted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `revokeConsent`

**Permission required:** `clinic.consent.manage`

**Description:** Revoke consent for a specific purpose.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `purpose` | `string` | yes |  |
| `reason` | `string` | no |  |

**Returns:** `Result<ConsentRecord>`

**Audit:** emits an entry with action `clinic.consent.revoked`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `hasActiveConsent`

**Permission required:** `clinic.consent.check`

**Description:** Check whether a patient has active consent for a purpose. Audited as a check.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `purpose` | `string` | yes |  |

**Returns:** `Result<boolean>`

**Audit:** emits an entry with action `clinic.consent.checked`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
