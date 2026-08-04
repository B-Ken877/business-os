# Clinic Medical Records

> Consultation notes, history, clinical summaries, and records access.

**Component ID:** `clinic-medical-records`
**Industry:** Clinics / medical
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Store consultation notes and clinical summaries per patient, with strict access control and audit on every read.

## Business problem solved

Medical records on paper are insecure and unsearchable. This component centralises them with strict access logging.

## Supported industries

Clinics / medical.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record consultation notes per visit
- Link to patient and doctor
- Audit every read
- Strict need-to-know access

## Dependencies

- `@business-os/shared`
- `clinic-patient-management`

## Configuration options

- `maxNotesLengthChars` (`number`, default `20000`) — Max characters per consultation note.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `clinic.records.create`
- `clinic.records.read`
- `clinic.records.update`

## Data handled

Consultation notes, diagnoses, treatment plans, doctor identity. Highly sensitive medical data — access must be on a strict need-to-know basis.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No structured diagnosis coding (ICD-10).
- No document attachments — use document-management.

## Future improvements

- ICD-10 coding.
- Document attachments.
- Record versioning with revision history.

---

## Folder layout

```
clinic-medical-records/
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
