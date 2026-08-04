/**
 * HTTP-shaped API contract for service-customer-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Customer } from "../backend/types";
import type { CreateCustomerInput, SetPreferencesInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-customer-management/create-customer",
    permission: "service.customers.create",
    description: "Create a new customer.",
  },
  {
    method: "POST",
    path: "/v1/service-customer-management/set-preferences",
    permission: "service.customers.update",
    description: "Set the customer's preferences JSON.",
  },
];
