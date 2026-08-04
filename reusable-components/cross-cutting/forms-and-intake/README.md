# Forms & Intake

> Reusable, configurable intake forms with validation and submission handling.

**Component ID:** `forms-and-intake`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide a single surface for defining configurable forms (customer intake, patient registration, school enrollment, feedback survey) and collecting submissions, so every business can build forms without writing custom code per form.

## Business problem solved

Today, Haitian businesses collect intake information on paper — patient registration at clinics, student enrollment at schools, new customer at a shop. This component digitises the form definition and submission pipeline so any business can declare a form, share a link, and collect structured submissions.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Define a form with named fields, types, and validation rules
- Publish a form (make it submittable)
- Submit a form (validated against the schema)
- List submissions for a form
- Per-tenant form isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxFieldsPerForm` (`number`, default `50`) — Cap on fields per form.
- `maxSubmissionsPerForm` (`number`, default `10000`) — Cap on submissions stored per form.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `forms.define`
- `forms.publish`
- `forms.submit`
- `forms.readSubmissions`

## Data handled

Form definitions (field schemas), submissions (free-form values that may contain personal data depending on the form). Submissions are sensitive by default and must be access-controlled per form.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Field-level validation is declared but not enforced at submission time yet — the valuesJson is only checked for syntactic validity.
- No file upload fields yet — the future version will integrate with document-management.
- No public/anonymous submission yet — every submitter must be authenticated.

## Future improvements

- Field-level validation enforcement at submission time.
- File upload field type (integrates with document-management).
- Public/anonymous forms with per-form access tokens.

---

## Folder layout

```
forms-and-intake/
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
