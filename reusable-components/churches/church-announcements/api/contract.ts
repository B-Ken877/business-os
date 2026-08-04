/**
 * HTTP-shaped API contract for church-announcements.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Announcement } from "../backend/types";
import type { PublishAnnouncementInput, ListActiveAnnouncementsInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-announcements/publish-announcement",
    permission: "church.announcements.publish",
    description: "Publish a new announcement.",
  },
  {
    method: "GET",
    path: "/v1/church-announcements/list-active-announcements",
    permission: "church.announcements.read",
    description: "List all non-expired announcements for a given audience, newest first.",
  },
];
