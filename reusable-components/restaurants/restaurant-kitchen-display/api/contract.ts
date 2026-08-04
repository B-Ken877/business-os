/**
 * HTTP-shaped API contract for restaurant-kitchen-display.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { KitchenTicket } from "../backend/types";
import type { CreateTicketInput, MarkTicketReadyInput, ListTicketsForStationInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/restaurant-kitchen-display/create-ticket",
    permission: "restaurant.kitchen.tickets.update",
    description: "Create a kitchen ticket from an order.",
  },
  {
    method: "PATCH",
    path: "/v1/restaurant-kitchen-display/mark-ticket-ready",
    permission: "restaurant.kitchen.tickets.update",
    description: "Mark a kitchen ticket as ready for pickup.",
  },
  {
    method: "GET",
    path: "/v1/restaurant-kitchen-display/list-tickets-for-station",
    permission: "restaurant.kitchen.tickets.read",
    description: "List open tickets for a station, sorted by priority then placement time.",
  },
];
