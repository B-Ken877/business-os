# Clinic Patient Management

> Patient profiles, contact details, visit history, and identifiers.

**Component ID:** `clinic-patient-management`
**Industry:** Clinics / medical
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Maintain patient records with strict access control. Every read of a patient record is audited.

## Business problem solved

Patient records are among the most regulated data categories. This component centralises patient data with audit-on-read and tenant isolation.

## Supported industries

Clinics / medical.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create patient profiles
- Track visit history (via clinic-medical-records)
- Strict audit on every read
- Tenant isolation enforced

## Dependencies

- `@business-os/shared`

## Configuration options

- `requireDateOfBirth` (`boolean`, default `true`) — Whether date of birth is required.
- `maxPatientsPerTenant` (`number`, default `100000`) — Cap on patient records.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `clinic.patients.create`
- `clinic.patients.read`
- `clinic.patients.update`

## Data handled

Patient name, date of birth, contact details, identifiers. Medical data — protected by health data regulations. Every read is audited.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No consent management yet — the future core:consent module will integrate here.
- No data export/deletion workflow for patient data rights.

## Future improvements

- Consent management.
- Patient data rights (export, deletion).
- Patient portal access.

---

## Folder layout

```
clinic-patient-management/
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
