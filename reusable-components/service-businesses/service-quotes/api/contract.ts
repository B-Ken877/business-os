/**
 * HTTP-shaped API contract for service-quotes.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Quote } from "../backend/types";
import type { CreateQuoteInput, ApproveQuoteInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-quotes/create-quote",
    permission: "service.quotes.create",
    description: "Create a new quote in draft status.",
  },
  {
    method: "POST",
    path: "/v1/service-quotes/approve-quote",
    permission: "service.quotes.approve",
    description: "Approve a quote. Only drafts can be approved.",
  },
];
