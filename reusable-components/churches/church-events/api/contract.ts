/**
 * HTTP-shaped API contract for church-events.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Event, EventRegistration } from "../backend/types";
import type { CreateEventInput, RegisterForMemberInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-events/create-event",
    permission: "church.events.manage",
    description: "Create a new event.",
  },
  {
    method: "POST",
    path: "/v1/church-events/register-for-member",
    permission: "church.events.register",
    description: "Register a member for an event. Enforces capacity.",
  },
];
