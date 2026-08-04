# Notes & Comments

> Internal notes, customer notes, and collaboration comments attached to any entity.

**Component ID:** `notes-and-comments`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

> ⚠️ **This component handles sensitive data.** All read and write paths MUST go through the documented API so that tenant isolation, permission checks, and audit logging are enforced. Direct table access is forbidden. See `ai-instructions/security-rules.md`.

---

## Purpose

Provide a single tenant-scoped surface for attaching free-form notes and threaded comments to any business entity (customer, patient, order, invoice, etc.) so staff can collaborate without scattering context across personal channels.

## Business problem solved

Without a shared notes layer, every component reinvents 'add a note to this customer' — with different storage, different visibility rules, and different audit behavior. This component centralises that capability so a note left on a customer by a cashier is visible to a manager, and a thread on an invoice is preserved across roles.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Attach a note to any entity (entityType + entityId)
- Thread notes via an optional parentId
- Mark a note as internal (staff-only) or visible-to-customer
- Edit a note (kept as a new version; old versions are immutable)
- Soft-delete a note with audit
- Per-entity note listing

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxNoteLength` (`number`, default `5000`) — Maximum characters per note body.
- `maxThreadDepth` (`number`, default `5`) — Maximum nesting depth for threaded replies.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `notes.create`
- `notes.read`
- `notes.update`
- `notes.delete`

## Data handled

Note body (free-form text, may contain personal or commercial context), author identity, attached entity reference, visibility flag, edit history.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Note bodies are not encrypted at rest at the application layer — the future DB adapter must enforce encryption.
- No rich-text support — bodies are plain text only.
- No @mentions — a future version may add structured mentions with notifications.

## Future improvements

- Note versioning with diff view.
- Pinned notes per entity.
- Reactions (👍, etc.) on notes.

---

## Folder layout

```
notes-and-comments/
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
