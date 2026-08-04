# API Contract — `clinic-triage`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordTriage`

**Permission required:** `clinic.triage.intake`

**Description:** Record a triage entry at patient intake.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `patientId` | `string` | yes |  |
| `visitReason` | `string` | yes |  |
| `symptomsJson` | `string` | no |  |
| `urgency` | `string` | yes |  |

**Returns:** `Result<TriageEntry>`

**Audit:** emits an entry with action `clinic.triage.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listEmergencyTriage`

**Permission required:** `clinic.triage.read`

**Description:** List all triage entries classified as emergency, newest first.

**Input:** none.

**Returns:** `Result<readonly TriageEntry[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
