/**
 * HTTP-shaped API contract for retail-customer-management.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Customer } from "../backend/types";
import type { CreateCustomerInput, UpdateStatusInput, AddLoyaltyNoteInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/retail-customer-management/create-customer",
    permission: "retail.customers.create",
    description: "Create a new customer record.",
  },
  {
    method: "PATCH",
    path: "/v1/retail-customer-management/update-status",
    permission: "retail.customers.update",
    description: "Update a customer's status (active, vip, blacklisted).",
  },
  {
    method: "POST",
    path: "/v1/retail-customer-management/add-loyalty-note",
    permission: "retail.customers.update",
    description: "Append a loyalty note to a customer's record. Existing notes are preserved.",
  },
];
