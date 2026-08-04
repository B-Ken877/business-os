# API Contract — `school-certificates`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `issueCertificate`

**Permission required:** `school.certificates.issue`

**Description:** Issue a new certificate to a student.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `programName` | `string` | yes |  |
| `certificateNumber` | `string` | yes |  |

**Returns:** `Result<Certificate>`

**Audit:** emits an entry with action `school.certificate.issued`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `revokeCertificate`

**Permission required:** `school.certificates.revoke`

**Description:** Revoke a certificate (e.g. due to academic dishonesty).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `certificateId` | `string` | yes |  |

**Returns:** `Result<Certificate>`

**Audit:** emits an entry with action `school.certificate.revoked`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
