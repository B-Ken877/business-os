# School Student Enrollment

> Student onboarding, admissions, student profiles, and enrollment status.

**Component ID:** `school-student-enrollment`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Manage the lifecycle of a student from application through enrollment to graduation or withdrawal.

## Business problem solved

Schools track students in paper files that get lost. This component makes student records queryable and links each student to their academic record.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create student profiles
- Track enrollment status (applicant, enrolled, withdrawn, graduated)
- Link guardian contacts
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxStudentsPerTenant` (`number`, default `10000`) — Cap on student records.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.students.create`
- `school.students.update`
- `school.students.read`

## Data handled

Student name, date of birth, guardian contacts, enrollment status. Student data — especially for minors — requires parental consent and restricted access.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No document attachments (use document-management).
- No bulk import.

## Future improvements

- Bulk import via CSV.
- Document attachments via document-management.
- Guardian portal access.

---

## Folder layout

```
school-student-enrollment/
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
