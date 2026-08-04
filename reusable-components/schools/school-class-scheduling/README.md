# School Class Scheduling

> Timetable, classes, rooms, teacher assignments, and schedule conflict detection.

**Component ID:** `school-class-scheduling`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Define the weekly timetable: which class meets when, in which room, taught by whom. Detect conflicts (teacher double-booked, room double-booked).

## Business problem solved

Paper timetables can't detect conflicts. This component makes scheduling queryable and conflict-aware.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Define class sessions (subject, day, time, room, teacher)
- Detect teacher conflicts
- Detect room conflicts
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `sessionDurationMinutes` (`number`, default `45`) — Default session duration.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.scheduling.manage`
- `school.scheduling.read`

## Data handled

Teacher identity, room assignments, schedule. Not highly sensitive but operationally critical.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No term/semester scoping yet.
- No student-class enrollment.

## Future improvements

- Term/semester scoping.
- Student-class enrollment.
- Automatic timetable generation.

---

## Folder layout

```
school-class-scheduling/
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
