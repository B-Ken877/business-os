/**
 * HTTP-shaped API contract for restaurant-table-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Table } from "../backend/types";
import type { CreateTableInput, AssignOrderToTableInput, ReleaseTableInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-table-management/create-table",
    permission: "restaurant.tables.manage",
    description: "Define a new table.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-table-management/assign-order-to-table",
    permission: "restaurant.tables.assign",
    description: "Assign an order to a free table, marking the table as seated.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-table-management/release-table",
    permission: "restaurant.tables.assign",
    description: "Release a table after the order is served. Marks the table as dirty for cleaning.",
  },
];
