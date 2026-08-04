# core/authorization

> Roles, permissions, and the real `PermissionChecker` — enforces "what is this user allowed to do, in this tenant?"

**Module ID:** `core/authorization`
**Layer:** 1 (Core)
**Stability:** stable — every protected endpoint depends on this module.

---

## Purpose

Implement the platform's RBAC (role-based access control) model. Provide the `PermissionChecker` implementation that every component uses to enforce permissions, plus the role-management operations (define, grant, revoke).

## Business problem solved

Per `ai-instructions/security-rules.md` §3, every operation that modifies or reveals data must check a permission. Without a central authorization module, every component would invent its own permission model — inconsistent, un-auditable, and impossible to reason about.

This module centralizes authorization:
- **Roles** are named bundles of permissions, defined per-tenant.
- **Grants** assign a role to a user within a tenant.
- **System roles** (owner, administrator, member, viewer) are seeded for every new tenant.
- The `StorePermissionChecker` is the production `PermissionChecker` — it loads the user's grants, resolves their permissions, and answers `has(ctx, permission)`.

## Features

- Seed system roles for a new tenant
- Define custom roles (with permission validation)
- Grant a role to a user
- Revoke a role from a user
- List role definitions for a tenant
- List the current user's active grants
- `StorePermissionChecker` — the production `PermissionChecker` implementation

## Dependencies

- `@business-os/shared` — `PermissionChecker`, `Permission`, `TenantContext`, `AuditSink`.

## Configuration options

| Key | Type | Default | Description |
|---|---|---|---|
| `maxCustomRolesPerTenant` | `number` | `50` | Cap on custom roles per tenant (excludes system roles). |

## Permissions required

- `roles.read` — to list role definitions
- `roles.manage` — to define roles, grant, or revoke
- `authenticated` — to list one's own grants

## Permission model

Permissions are expressed as `<resource>.<action>` strings (e.g. `retail.products.create`). The checker supports two wildcards:

- `*.*` — matches every permission (granted to the owner role by default)
- `<resource>.*` — matches every action on a resource (e.g. `retail.*` matches `retail.products.create`, `retail.pos.checkout`, etc.)

Wildcards are evaluated by the `StorePermissionChecker.has()` method. A future version may add more granular wildcards (`*.read`).

## Data handled

- **Role definitions** — name, description, permission list, system flag.
- **Role grants** — user-tenant-role triple with status.

Reveals organizational structure (who can do what). Access is limited to members of the same tenant.

## API interfaces

See `api/contract.ts` for the HTTP routes.

## Limitations

- **No role inheritance** — a user has one or more roles per tenant, but roles do not imply other roles.
- **No attribute-based access control (ABAC)** — permissions are role-based only. A future version may add resource-level checks (e.g. "this user can edit only products they created").
- **No permission catalog query** — components declare their permissions in their `component.json`, but there's no central query for "what permissions exist on this tenant?"

## Future improvements

- Role inheritance.
- ABAC for resource-level checks.
- Central permission catalog (aggregate from all components' manifests).
- Periodic permission review (require owners to re-confirm grants annually).
