# API Contract — `school-tuition-management`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createTuitionPlan`

**Permission required:** `school.tuition.manage`

**Description:** Create a tuition plan for a student.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `studentId` | `string` | yes |  |
| `totalAmountCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `installmentsJson` | `string` | yes |  |

**Returns:** `Result<TuitionPlan>`

**Audit:** emits an entry with action `school.tuition.plan_created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `recordTuitionPayment`

**Permission required:** `school.tuition.record_payment`

**Description:** Record a tuition payment against a plan.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `planId` | `string` | yes |  |
| `amountCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `paymentReference` | `string` | no |  |

**Returns:** `Result<TuitionPayment>`

**Audit:** emits an entry with action `school.tuition.payment_recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `computeOutstandingBalance`

**Permission required:** `school.tuition.read`

**Description:** Compute the outstanding balance for a plan.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `planId` | `string` | yes |  |

**Returns:** `Result<{ totalAmountCents: number; paidAmountCents: number; outstandingCents: number }>`

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
