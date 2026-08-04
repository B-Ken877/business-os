/**
 * BACKWARDS-COMPATIBILITY SHIM.
 *
 * The shared primitives have been promoted to `core/platform/`. This file
 * re-exports them so that any code still importing from
 * `reusable-components/_shared/` continues to work during the transition.
 *
 * New code should import from `@business-os/shared` (which points at
 * `core/platform/index.ts`) or `@business-os/core` (which points at
 * `core/index.ts`).
 *
 * This shim will be removed once all consumers have migrated. Tracked as
 * a follow-up issue.
 */

export * from "../../core/platform/index";
