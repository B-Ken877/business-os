/**
 * HTTP-shaped API contract for activity-timeline.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { TimelineEvent } from "../backend/types";
import type { RecordEventInput, ListEventsForEntityInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/activity-timeline/record-event",
    permission: "timeline.events.record",
    description: "Record an event for an entity. Events are immutable once recorded.",
  },
  {
    method: "GET",
    path: "/v1/activity-timeline/list-events-for-entity",
    permission: "timeline.events.read",
    description: "List all events for an entity, newest first.",
  },
];
