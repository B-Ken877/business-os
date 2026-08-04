# School Attendance

> Attendance recording, summaries, and late tracking.

**Component ID:** `school-attendance`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Record per-student per-session attendance (present, absent, late) and produce summaries for reporting and parent communication.

## Business problem solved

Paper attendance sheets are lost and never aggregated. This component makes attendance queryable and automatable (alerts on absence).

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record attendance per student per session
- Compute attendance rate per student
- Flag chronic absences
- Trigger parent alerts via notifications-center

## Dependencies

- `@business-os/shared`
- `school-student-enrollment`

## Configuration options

- `chronicAbsenceThresholdPct` (`number`, default `20`) — Absent percentage above which a student is flagged chronic.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.attendance.record`
- `school.attendance.read`

## Data handled

Student identity, attendance status, session date. Attendance patterns reveal student engagement; access must be role-limited.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No automatic parent alerts — the orchestrator must check isChronic and call notifications-center.
- No class/session scoping yet.

## Future improvements

- Class/session scoping.
- Automatic parent alerts on chronic absence.
- Makeup session tracking.

---

## Folder layout

```
school-attendance/
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
