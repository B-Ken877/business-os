# Church Sermons

> Sermon archive, sermon metadata, media references, and series tracking.

**Component ID:** `church-sermons`
**Industry:** Churches / faith-based
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Maintain an archive of sermons with their metadata (date, speaker, scripture references, series), so members can search and listen to past sermons.

## Business problem solved

Sermon audio is scattered across personal devices. This component makes the archive queryable.

## Supported industries

Churches / faith-based.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Record sermon metadata
- Link to media (audio/video) via document-management
- Track sermon series
- Search by speaker, date, or scripture

## Dependencies

- `@business-os/shared`
- `document-management`

## Configuration options

- `maxSermonsPerTenant` (`number`, default `10000`) — Cap on sermon records.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `church.sermons.manage`
- `church.sermons.read`

## Data handled

Sermon title, speaker, date, scripture references, series. Public by nature — not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No full-text search of sermon content.
- No audio streaming — only document references.

## Future improvements

- Full-text search of sermon transcripts.
- Audio streaming integration.
- Series management operations.

---

## Folder layout

```
church-sermons/
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
