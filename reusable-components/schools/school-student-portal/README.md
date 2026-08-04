# School Student Portal

> Student-facing access to schedule, results, and communications.

**Component ID:** `school-student-portal`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide the contract for a student-facing portal: what the student can see (their schedule, their grades, their messages) and what they cannot (other students' data, administrative data).

## Business problem solved

Without a portal contract, schools either give students no access or accidentally expose other students' data. This component codifies the boundary.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Student can view their own schedule
- Student can view their own grades
- Student can view their own messages
- Strict isolation: a student cannot see another student's data

## Dependencies

- `@business-os/shared`
- `school-student-enrollment`
- `school-grading`
- `school-class-scheduling`

## Configuration options

- `allowStudentMessageReply` (`boolean`, default `false`) — Whether students can reply to parent messages.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.portal.student.view`

## Data handled

Aggregated view of the student's own data. Sensitive — access must be strictly scoped to the student's own records.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No actual data fetching yet — the orchestrator must call school-grading.computeStudentAverage etc. with the studentId.
- No identity binding enforcement at this layer.

## Future improvements

- Identity binding enforcement.
- Direct data fetching with strict student-scoping.
- Read receipts for messages.

---

## Folder layout

```
school-student-portal/
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
