# API Contract — `church-donations`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `recordDonation`

**Permission required:** `church.donations.record`

**Description:** Record a new donation.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | `string` | yes |  |
| `amountCents` | `number` | yes |  |
| `currency` | `string` | yes |  |
| `fund` | `string` | yes |  |
| `method` | `string` | yes |  |
| `paymentReference` | `string` | no |  |

**Returns:** `Result<Donation>`

**Audit:** emits an entry with action `church.donation.recorded`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `computeMemberGivingTotal`

**Permission required:** `church.donations.read_member_history`

**Description:** Compute a member's total giving over a date range. Requires the elevated 'read_member_history' permission because giving history is especially sensitive.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `memberId` | `string` | yes |  |
| `fromDate` | `string` | yes |  |
| `toDate` | `string` | yes |  |

**Returns:** `Result<{ totalCents: number; currency: string; donationCount: number }>`

**Audit:** emits an entry with action `church.donation.member_history_accessed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
