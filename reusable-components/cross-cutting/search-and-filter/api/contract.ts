/**
 * HTTP-shaped API contract for search-and-filter.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { SavedQuery } from "../backend/types";
import type { RunQueryInput, SaveQueryInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/search-and-filter/run-query",
    permission: "search.query",
    description: "Run a search/filter/sort/paginate query against a list of items supplied by the caller.",
  },
  {
    method: "POST",
    path: "/v1/search-and-filter/save-query",
    permission: "search.query",
    description: "Persist a query for later re-use by the same user.",
  },
];
