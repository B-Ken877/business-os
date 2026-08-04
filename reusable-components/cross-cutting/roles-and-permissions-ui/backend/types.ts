/**
 * Domain types for the roles-and-permissions-ui component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// RoleDefinition
//////////////////////////////////////////////////////////////////////
/** A named bundle of permissions assignable to users. */
export interface RoleDefinition {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Role name (unique per tenant). */
  readonly name: string;
  /** Human-readable description. */
  readonly description: string | null;
  /** JSON-serialised list of permission strings. */
  readonly permissionsJson: string;
  /** True if this is a platform-seeded role (cannot be deleted). */
  readonly isSystem: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

/**
 * UI hook contract — implemented by the future UI layer.
 * The reusable component exports only the *contract*; the implementation
 * lives in the UI layer so it can integrate with the platform's auth state.
 */
export interface UseHasPermissionHook {
  (permission: string): boolean;
}

/**
 * UI component contract for a permission gate. The `children` and `fallback`
 * are intentionally typed as `unknown` because React is not a dependency of
 * this layer — the UI layer (which will depend on React) will reinterpret
 * these values when rendering.
 */
export interface PermissionGateProps {
  readonly permission: string;
  readonly children: unknown;
  readonly fallback?: unknown;
}
