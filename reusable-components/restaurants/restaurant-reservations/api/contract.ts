/**
 * HTTP-shaped API contract for restaurant-reservations.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Reservation } from "../backend/types";
import type { CreateReservationInput, CancelReservationInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-reservations/create-reservation",
    permission: "restaurant.reservations.create",
    description: "Create a new reservation.",
  },
  {
    method: "POST",
    path: "/v1/restaurant-reservations/cancel-reservation",
    permission: "restaurant.reservations.cancel",
    description: "Cancel a reservation.",
  },
];
