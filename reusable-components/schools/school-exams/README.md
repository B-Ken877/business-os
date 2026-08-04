# School Exams

> Exam setup, exam results, exam tracking, and academic periods.

**Component ID:** `school-exams`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Define exam periods, link assessments to them, and track which exams have been graded.

## Business problem solved

Exams span multiple assessments and a date range. Without a unifying entity, reporting per exam period is impossible.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Define an exam period (midterm, final)
- Link assessments to an exam period
- Track grading progress

## Dependencies

- `@business-os/shared`
- `school-grading`

## Configuration options

- `defaultExamWindowDays` (`number`, default `7`) — Default exam window length.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.exams.manage`
- `school.exams.read`

## Data handled

Exam metadata, assessment links, grading progress. Not sensitive in itself but links to grade data.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No assessment-exam link yet (assessments are managed by school-grading).

## Future improvements

- Assessment-exam link.
- Automatic grading progress tracking.
- Report card generation per exam period.

---

## Folder layout

```
school-exams/
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
