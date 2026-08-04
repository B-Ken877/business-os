# Shared Primitives (DEPRECATED — moved to `core/platform/`)

> The contents of this folder have been promoted to `core/platform/`. This folder is now a backwards-compatibility shim only.

---

## What happened

As part of the core layer build, the shared primitives (`TenantContext`, `PermissionChecker`, `Result`, `AuditSink`, `EntityId`, `ErrorCode`) were promoted from `reusable-components/_shared/` to `core/platform/`. This promotion is documented in `ai-instructions/architecture-rules.md` §2 — these are universal platform primitives, not reusable business capabilities, so they belong in Layer 1.

## What's still here

- `index.ts` — a single re-export file that forwards everything from `core/platform/index.ts`. Any code importing from `reusable-components/_shared/` continues to work without changes.

## What to do

- **New code:** import from `@business-os/shared` (alias for `core/platform/index.ts`) or `@business-os/core` (alias for `core/index.ts`).
- **Existing code:** no action required — the shim keeps it working. When convenient, update imports to `@business-os/shared`.

## Removal plan

This shim will be removed in a future release once all consumers (including the 65 reusable components, if they still import from this path) have migrated to the `@business-os/shared` alias. The alias already points at the new location, so migration is a no-op for code that uses the alias.

Tracked as a follow-up issue.
