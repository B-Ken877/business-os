/**
 * HTTP-shaped API contract for church-member-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Member } from "../backend/types";
import type { CreateMemberInput, UpdateOwnVisibilityInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-member-management/create-member",
    permission: "church.members.manage",
    description: "Create a new member record.",
  },
  {
    method: "GET",
    path: "/v1/church-member-management/list-visible-members",
    permission: "church.members.read",
    description: "List all members whose directory visibility is 'visible' and whose status is 'active'.",
  },
  {
    method: "PATCH",
    path: "/v1/church-member-management/update-own-visibility",
    permission: "church.members.update_own",
    description: "A member updates their own directory visibility. The caller's userId must match the member's id (enforced by the orchestrator).",
  },
];
