/**
 * HTTP-shaped API contract for core/identity.
 *
 * Declares the routes the identity module exposes. The actual server is
 * implemented by the future core/http module; this is the contract it
 * will satisfy.
 */

import type { RouteContract } from "@business-os/core/http/contract";

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/identity/register",
    permission: "public", // bootstrapping — no auth required
    description: "Register a new user with email + password.",
  },
  {
    method: "POST",
    path: "/v1/identity/login",
    permission: "public",
    description: "Log in with email + password. Returns a session token.",
  },
  {
    method: "POST",
    path: "/v1/identity/logout",
    permission: "authenticated",
    description: "Revoke the current session.",
  },
  {
    method: "GET",
    path: "/v1/identity/me",
    permission: "authenticated",
    description: "Get the current authenticated user.",
  },
  {
    method: "POST",
    path: "/v1/identity/change-password",
    permission: "authenticated",
    description: "Change the current user's password.",
  },
  {
    method: "POST",
    path: "/v1/identity/revoke-all-sessions",
    permission: "authenticated",
    description: "Revoke all sessions for the current user.",
  },
];
