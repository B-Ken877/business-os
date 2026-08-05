/**
 * Public barrel for the core layer (Layer 1).
 *
 * Re-exports the platform primitives so consumers can import everything
 * from a single path:
 *
 *   import { type TenantContext, ok, err } from "@business-os/core";
 *
 * Individual core modules (identity, organizations, authorization, etc.)
 * are NOT re-exported here — they are imported directly from their folders:
 *
 *   import { loginUser } from "@business-os/core/identity";
 *
 * This keeps the top-level barrel lightweight and avoids pulling in
 * dependencies (like password hashing) that not every consumer needs.
 */

export * from "./platform/index";
