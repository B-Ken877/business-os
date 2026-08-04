# API Contract — `service-feedback`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `submitFeedback`

**Permission required:** `service.feedback.create`

**Description:** Submit feedback for a booking.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `bookingId` | `string` | yes |  |
| `rating` | `number` | yes |  |
| `comment` | `string` | no |  |

**Returns:** `Result<Feedback>`

**Audit:** emits an entry with action `service.feedback.submitted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `listNeedsFollowUp`

**Permission required:** `service.feedback.read`

**Description:** List all feedback that needs follow-up (low ratings).

**Input:** none.

**Returns:** `Result<readonly Feedback[]>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
