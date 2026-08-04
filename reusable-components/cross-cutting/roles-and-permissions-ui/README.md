# Roles & Permissions UI

> Reusable permission-aware UI patterns that plug into the platform authorization model.

**Component ID:** `roles-and-permissions-ui`
**Industry:** Cross-cutting (multiple industries)
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Provide reusable TypeScript helpers and React component contracts that the future UI layer can use to render permission-aware interfaces (show/hide buttons, route guards, role pickers) without each component reinventing the integration with the platform's authorization model.

## Business problem solved

Without a shared permission-aware UI helper, every component that wants to hide a 'Delete' button for non-admins invents its own hook, its own prop drilling, and its own permission check. This component centralises the contract so the future UI is consistent.

## Supported industries

Cross-cutting (multiple industries).

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- useHasPermission hook contract (UI layer implements)
- PermissionGate component contract (UI layer implements)
- Role picker component contract
- Permission catalog (lists all permissions a component exposes)
- Per-tenant role definition helpers

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultRoleOnInvite` (`string`, default `"member"`) — Default role assigned when a new user is invited.
- `allowOwnerRoleEditing` (`boolean`, default `false`) — Whether the owner role can be edited through this UI (default: no).

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `roles.read`
- `roles.manage`
- `permissions.read`

## Data handled

Role names, permission grants per role, user-role assignments. Role assignments reveal organisational structure.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No UI implementation yet — this component exports only the contract and the backend helpers (defineRole, listRoles). The future UI layer will provide the React implementation.
- No permission inheritance between roles — each role is a flat list.
- No role hierarchy — 'manager implies member' is not supported.

## Future improvements

- Role inheritance.
- Permission grouping (e.g. 'all inventory permissions').
- Audit log of permission grants and revokes per user.

---

## Folder layout

```
roles-and-permissions-ui/
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
