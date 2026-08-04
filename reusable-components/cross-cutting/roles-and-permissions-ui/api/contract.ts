/**
 * HTTP-shaped API contract for roles-and-permissions-ui.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { RoleDefinition } from "../backend/types";
import type { DefineRoleInput, ListPermissionsForRoleInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/roles-and-permissions-ui/define-role",
    permission: "roles.manage",
    description: "Define a new role for the tenant.",
  },
  {
    method: "GET",
    path: "/v1/roles-and-permissions-ui/list-roles",
    permission: "roles.read",
    description: "List all roles defined in the tenant.",
  },
  {
    method: "GET",
    path: "/v1/roles-and-permissions-ui/list-permissions-for-role",
    permission: "permissions.read",
    description: "Return the parsed permission list for a role.",
  },
];
