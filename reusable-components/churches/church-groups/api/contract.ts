/**
 * HTTP-shaped API contract for church-groups.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Group, GroupMembership } from "../backend/types";
import type { CreateGroupInput, JoinGroupInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-groups/create-group",
    permission: "church.groups.manage",
    description: "Create a new group.",
  },
  {
    method: "POST",
    path: "/v1/church-groups/join-group",
    permission: "church.groups.join",
    description: "Add a member to a group. Enforces max members.",
  },
];
