# Shared Primitives (`_shared/`)

> Cross-cutting type definitions and minimal runtime helpers shared by every reusable component.
> These are **platform primitives**, not business capabilities — they belong in `core/` once that layer is built, and are explicitly **pending promotion to Layer 1**.

---

## Why this folder exists

`reusable-components/` needs a single source of truth for the cross-cutting concerns every component must respect:

- **Tenant context** — every operation runs on behalf of a specific tenant.
- **Permission checking** — every operation must declare and enforce required permissions.
- **Result type** — operations return a discriminated `Result` instead of throwing, so failures are explicit and reviewable.
- **Audit entry** — every state-changing operation must produce an audit-friendly event.
- **ID conventions** — stable shape for entity identifiers.

The constitution (`architecture-rules.md` §3 and `security-rules.md` §3) makes these mandatory. Until `core/` exists, they live here so that components can be built and tested against a stable contract. When `core/` is created, this folder should be moved (or re-exported) from `core/` with no breaking changes to component imports.

---

## What is here

| File | Purpose |
|---|---|
| `tenant.ts` | `TenantContext`, `TenantId`, `UserId` types and the `assertSameTenant` helper. |
| `permissions.ts` | `Permission`, `Role`, `PermissionChecker` interface, and `denyByDefault` checker. |
| `result.ts` | `Result<T, E>` discriminated union + `ok()` / `err()` constructors. |
| `audit.ts` | `AuditEntry` shape and `createAuditEntry` factory. |
| `ids.ts` | `EntityId` type and `generateId()` helper (deterministic in tests, randomized in prod). |
| `errors.ts` | The well-known error codes every component should reuse. |
| `index.ts` | Public barrel — the only path components should import from. |

---

## What is NOT here

- No business logic.
- No industry-specific types.
- No database adapter (components define their own persistence interfaces).
- No HTTP server, no framework.
- No secrets, no real credentials.

If a file in this folder starts to know about a specific industry (e.g., it mentions "patient" or "menu"), it has violated its boundary and must be refactored.

---

## Promotion path to `core/`

When `core/` is created:

1. Move the contents of `_shared/` into `core/platform/` (or equivalent).
2. Keep the public exports identical.
3. Update the `@business-os/shared` alias in `tsconfig.json` and `vitest.config.ts` to point at `core/`.
4. No component code should need to change.

Until then, every component imports from `@business-os/shared` and is fully testable in isolation.

---

## Tests

`tests/primitives.test.ts` verifies the contracts of every helper in this folder. Run with `npm test` from the repository root.
