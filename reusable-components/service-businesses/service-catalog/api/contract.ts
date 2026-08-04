/**
 * HTTP-shaped API contract for service-catalog.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Service } from "../backend/types";
import type { CreateServiceInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-catalog/create-service",
    permission: "service.catalog.manage",
    description: "Create a new service.",
  },
  {
    method: "GET",
    path: "/v1/service-catalog/list-active-services",
    permission: "service.catalog.read",
    description: "List all active services.",
  },
];
