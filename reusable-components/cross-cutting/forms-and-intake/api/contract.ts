/**
 * HTTP-shaped API contract for forms-and-intake.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { FormDefinition, FormSubmission } from "../backend/types";
import type { DefineFormInput, PublishFormInput, SubmitFormInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/forms-and-intake/define-form",
    permission: "forms.define",
    description: "Define a new form.",
  },
  {
    method: "POST",
    path: "/v1/forms-and-intake/publish-form",
    permission: "forms.publish",
    description: "Publish a draft form so it can accept submissions.",
  },
  {
    method: "POST",
    path: "/v1/forms-and-intake/submit-form",
    permission: "forms.submit",
    description: "Submit values to a published form.",
  },
];
