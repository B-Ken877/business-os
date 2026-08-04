# Search & Filter

> Reusable list search, filtering, sorting, and pagination behaviour.

**Component ID:** `search-and-filter`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Provide a single, tenant-scoped surface for searching and filtering lists of any entity type, so every list view in the platform (customers, products, patients, students) has consistent pagination, sort, and filter behaviour without duplicating that logic per component.

## Business problem solved

Without a shared search/filter layer, every component reinvents pagination cursors, sort direction handling, and filter parsing. This component standardises those concerns so the future UI can render any list with the same controls and the same backend contract.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Tokenise a free-text query into search terms
- Apply declared filters (field, operator, value)
- Sort by any declared field, ascending or descending
- Cursor-based pagination (stable across inserts)
- Per-tenant isolation enforced

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultPageSize` (`number`, default `20`) — Default items per page.
- `maxPageSize` (`number`, default `100`) — Maximum items per page a caller can request.
- `maxFilterClauses` (`number`, default `10`) — Maximum number of filter clauses per query.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `search.query`

## Data handled

Query text, filter values (may reference sensitive fields), pagination cursor. The component itself does not store data; it operates on lists supplied by the caller.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- Full-text search is naive substring matching — a future version will integrate a real search index.
- No filter clauses yet — only free-text query. Filters will be added when the typed query variant is built.
- Cursor is index-based, not stable across inserts — a future version will use a stable sort key.

## Future improvements

- Typed query variant per entityType (e.g. CustomerQuery, ProductQuery).
- Filter clause parser (field, op, value).
- Stable cursor based on a sort key rather than index.

---

## Folder layout

```
search-and-filter/
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
