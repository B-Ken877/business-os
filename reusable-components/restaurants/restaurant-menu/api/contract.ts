/**
 * HTTP-shaped API contract for restaurant-menu.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { MenuItem } from "../backend/types";
import type { CreateMenuItemInput, SetAvailabilityInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-menu/create-menu-item",
    permission: "restaurant.menu.items.manage",
    description: "Create a new menu item.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-menu/set-availability",
    permission: "restaurant.menu.availability.manage",
    description: "Mark a menu item as available or 86'd.",
  },
];
