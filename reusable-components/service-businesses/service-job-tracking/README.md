# Service Job Tracking

> Work orders, task progress, and service completion tracking.

**Component ID:** `service-job-tracking`
**Industry:** Service-based businesses
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Track multi-step service jobs (e.g. a repair with diagnosis, parts ordering, and final fix) from creation to completion.

## Business problem solved

Complex services span multiple steps and days. Without structured tracking, steps are forgotten. This component makes the job pipeline queryable.

## Supported industries

Service-based businesses.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create jobs with multiple tasks
- Track per-task status
- Mark job complete when all tasks done
- Per-tenant isolation

## Dependencies

- `@business-os/shared`
- `service-booking`

## Configuration options

- `maxTasksPerJob` (`number`, default `50`) — Cap on tasks per job.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `service.jobs.manage`
- `service.jobs.read`
- `service.jobs.update_task`

## Data handled

Job contents, task progress, staff assignments. May contain customer context.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No task assignment to specific staff.
- No time tracking per task.

## Future improvements

- Task assignment.
- Time tracking.
- Job templates.

---

## Folder layout

```
service-job-tracking/
├── README.md                  (this file)
├── component.json             (machine-readable manifest)
├── documentation/
│   ├── contract.md            (API contract)
│   └── configuration.md       (config reference)
├── backend/
│   ├── types.ts               (domain types — the canonical contract)
│   ├── validation.ts          (input validation helpers)
│   ├── logic.ts               (operations + permission/audit enforcement)
│   └── index.ts               (public barrel)
├── database/
│   └── schema.ts              (data model — types only, no DB adapter yet)
├── api/
│   └── contract.ts            (HTTP-shaped contract — types only)
├── config/
│   ├── schema.ts              (config schema)
│   └── defaults.ts            (default values)
├── tests/
│   ├── logic.test.ts          (happy path + business rules)
│   ├── validation.test.ts     (input validation)
│   └── tenant-isolation.test.ts (cross-tenant access denial)
└── examples/
    └── basic-usage.ts
```
