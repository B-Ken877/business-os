# API Contract — `service-job-tracking`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `createJob`

**Permission required:** `service.jobs.manage`

**Description:** Create a new job.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `customerId` | `string` | yes |  |
| `title` | `string` | yes |  |
| `bookingId` | `string` | no |  |

**Returns:** `Result<Job>`

**Audit:** emits an entry with action `service.job.created`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `addTask`

**Permission required:** `service.jobs.manage`

**Description:** Add a task to a job.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `jobId` | `string` | yes |  |
| `title` | `string` | yes |  |
| `order` | `number` | yes |  |

**Returns:** `Result<JobTask>`

**Audit:** emits an entry with action `service.job.task_added`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `completeTask`

**Permission required:** `service.jobs.update_task`

**Description:** Mark a task as completed. If all tasks are complete, the job is auto-completed.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `taskId` | `string` | yes |  |

**Returns:** `Result<JobTask>`

**Audit:** emits an entry with action `service.job.task_completed`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
