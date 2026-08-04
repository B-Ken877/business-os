# Platform Primitives (`core/platform/`)

> The absolute foundation of Business OS — cross-cutting primitives that every other module (core or reusable component) depends on.

**Status:** stable. These types are the most expensive to change on the platform — breaking changes here ripple through every component, every template, and every business project. Changes require architect-level review per `ai-instructions/architecture-rules.md` §2.

---

## What this module is

`core/platform/` holds the **universal primitives** that make the rest of the platform possible:

- **Tenant context** — every operation runs on behalf of a specific tenant; this is the type that carries that identity.
- **Permission checking** — the contract that every operation uses to answer "is this user allowed to do this, in this tenant?"
- **Result type** — explicit error handling instead of throwing, so failures are visible in signatures.
- **Audit entry** — the immutable record of "who did what, when, and from where."
- **Entity identifiers** — branded string ids that prevent accidental mixing of unrelated id types.
- **Error codes** — the well-known set of error codes every module reuses.

These are **not** business capabilities. They contain no industry knowledge, no business logic, no persistence. They are the vocabulary the rest of the platform speaks.

---

## Promotion history

This module was promoted from `reusable-components/_shared/` as part of the core layer build. The promotion is documented in the commit history. The `@business-os/shared` alias in `tsconfig.json` and `vitest.config.ts` points at this folder.

A backwards-compatibility shim remains at `reusable-components/_shared/index.ts` that re-exports everything from here, so any code that has not yet migrated to `@business-os/core` continues to work.

---

## Files

| File | Purpose |
|---|---|
| `tenant.ts` | `TenantContext`, `TenantId`, `UserId`, `assertSameTenant`, `TenantIsolationError` |
| `permissions.ts` | `Permission`, `Role`, `PermissionChecker` interface, `InMemoryPermissionChecker`, `DenyAllPermissionChecker`, `PermissionDeniedError` |
| `result.ts` | `Result<T, E>`, `ok()`, `err()`, `isOk()`, `isErr()`, `tryAsResult()` |
| `audit.ts` | `AuditEntry`, `AuditSink` interface, `InMemoryAuditSink`, `createAuditEntry()` |
| `ids.ts` | `EntityId`, `asEntityId()`, `generateId()` |
| `errors.ts` | `ErrorCode` constants |
| `index.ts` | Public barrel — import from here via `@business-os/shared` or `@business-os/core/platform` |

---

## What is NOT here

- No business logic.
- No industry-specific types.
- No database adapter.
- No HTTP server, no framework.
- No secrets, no real credentials.

If a file in this folder starts to know about a specific industry or a specific persistence technology, it has violated its boundary and must be refactored.

---

## Tests

`tests/primitives.test.ts` verifies the contracts of every primitive. Run with `npm test` from the repository root.
