# Church Member Management

> Member profiles, family grouping, contact records, and membership status.

**Component ID:** `church-member-management`
**Industry:** Churches / faith-based
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Maintain the church's member directory, group members into families, and track membership status (active, inactive, transferred).

## Business problem solved

Church membership data is often scattered across paper files and personal phones. This component centralises it with strict access control — church membership can be socially or even physically risky if exposed.

## Supported industries

Churches / faith-based.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create member profiles
- Group members into families/households
- Track membership status
- Member-controlled directory visibility

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultDirectoryVisibility` (`string`, default `"visible"`) — Default visibility of a new member in the directory.
- `maxMembersPerTenant` (`number`, default `50000`) — Cap on member records.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `church.members.manage`
- `church.members.read`
- `church.members.update_own`

## Data handled

Member name, contact details, family relationships, membership status. Sensitive — church membership can expose individuals to social or physical risk. Members must be able to control their own directory visibility.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No consent management for sensitive data fields.
- No family/household management operations yet.

## Future improvements

- Consent management.
- Family/household management.
- Member self-service portal.

---

## Folder layout

```
church-member-management/
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
