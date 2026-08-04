# Clinic Prescriptions

> Prescription creation, medication tracking, and refill notes.

**Component ID:** `clinic-prescriptions`
**Industry:** Clinics / medical
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Record prescriptions per patient visit, track medications, and note refills.

## Business problem solved

Paper prescriptions are lost and refills are untrackable. This component makes prescription history queryable per patient.

## Supported industries

Clinics / medical.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record prescriptions (medication, dosage, duration)
- Track refill history
- Link to medical record
- Audit on read

## Dependencies

- `@business-os/shared`
- `clinic-medical-records`

## Configuration options

- `maxRefillsAllowed` (`number`, default `3`) — Default max refills per prescription.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `clinic.prescriptions.create`
- `clinic.prescriptions.read`
- `clinic.prescriptions.refill`

## Data handled

Medication names, dosages, durations, patient identity. Medical data — sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No pharmacy integration.
- No controlled-substance tracking.

## Future improvements

- Pharmacy integration.
- Controlled-substance tracking.
- Drug interaction checking.

---

## Folder layout

```
clinic-prescriptions/
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
