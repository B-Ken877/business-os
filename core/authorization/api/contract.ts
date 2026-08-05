import type { RouteContract } from "@business-os/core/http/contract";

export const routes: readonly RouteContract[] = [
  {
    method: "GET",
    path: "/v1/authorization/roles",
    permission: "roles.read",
    description: "List all role definitions for the current tenant.",
  },
  {
    method: "POST",
    path: "/v1/authorization/roles",
    permission: "roles.manage",
    description: "Define a new custom role.",
  },
  {
    method: "POST",
    path: "/v1/authorization/grants",
    permission: "roles.manage",
    description: "Grant a role to a user.",
  },
  {
    method: "DELETE",
    path: "/v1/authorization/grants/{userId}/{roleName}",
    permission: "roles.manage",
    description: "Revoke a role from a user.",
  },
  {
    method: "GET",
    path: "/v1/authorization/grants/mine",
    permission: "authenticated",
    description: "List the current user's active role grants.",
  },
];
