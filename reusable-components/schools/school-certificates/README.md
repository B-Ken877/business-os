# School Certificates

> Certificate generation, completion status, and printable outputs.

**Component ID:** `school-certificates`
**Industry:** Schools / education
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Generate completion certificates for students (graduation, course completion), with a printable output via document-management.

## Business problem solved

Paper certificates are slow to produce and easy to lose. This component makes certificate generation queryable and printable.

## Supported industries

Schools / education.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create a certificate record
- Link to a student and a program
- Generate a printable PDF (via document-management)
- Track issuance status

## Dependencies

- `@business-os/shared`
- `school-student-enrollment`
- `document-management`

## Configuration options

- `certificateTemplateKey` (`string`, default `"default_graduation"`) — Default template key.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `school.certificates.issue`
- `school.certificates.read`
- `school.certificates.revoke`

## Data handled

Student identity, program name, issue date, certificate number. Not highly sensitive but verifiable identity.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No PDF generation — the orchestrator must call document-management to upload the generated PDF.

## Future improvements

- Automatic PDF generation.
- Public verification endpoint.
- Bulk issuance.

---

## Folder layout

```
school-certificates/
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
