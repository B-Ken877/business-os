/**
 * HTTP-shaped API contract for service-booking.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Booking } from "../backend/types";
import type { CreateBookingInput, MarkCompletedInput, MarkNoShowInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-booking/create-booking",
    permission: "service.bookings.create",
    description: "Create a new booking. Detects staff scheduling conflicts.",
  },
  {
    method: "PATCH",
    path: "/v1/service-booking/mark-completed",
    permission: "service.bookings.update_status",
    description: "Mark a booking as completed.",
  },
  {
    method: "PATCH",
    path: "/v1/service-booking/mark-no-show",
    permission: "service.bookings.update_status",
    description: "Mark a booking as a no-show.",
  },
];
