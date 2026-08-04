/**
 * HTTP-shaped API contract for church-sermons.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Sermon } from "../backend/types";
import type { RecordSermonInput, ListSermonsBySpeakerInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-sermons/record-sermon",
    permission: "church.sermons.manage",
    description: "Record a new sermon.",
  },
  {
    method: "GET",
    path: "/v1/church-sermons/list-sermons-by-speaker",
    permission: "church.sermons.read",
    description: "List all sermons by a given speaker, newest first.",
  },
];
