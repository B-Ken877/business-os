/**
 * HTTP-shaped API contract for service-feedback.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Feedback } from "../backend/types";
import type { SubmitFeedbackInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/service-feedback/submit-feedback",
    permission: "service.feedback.create",
    description: "Submit feedback for a booking.",
  },
  {
    method: "GET",
    path: "/v1/service-feedback/list-needs-follow-up",
    permission: "service.feedback.read",
    description: "List all feedback that needs follow-up (low ratings).",
  },
];
