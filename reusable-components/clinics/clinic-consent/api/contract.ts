/**
 * HTTP-shaped API contract for clinic-consent.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { ConsentRecord } from "../backend/types";
import type { GrantConsentInput, RevokeConsentInput, HasActiveConsentInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/clinic-consent/grant-consent",
    permission: "clinic.consent.manage",
    description: "Grant consent for a specific purpose. Idempotent: re-granting active consent is a no-op.",
  },
  {
    method: "POST",
    path: "/v1/clinic-consent/revoke-consent",
    permission: "clinic.consent.manage",
    description: "Revoke consent for a specific purpose.",
  },
  {
    method: "POST",
    path: "/v1/clinic-consent/has-active-consent",
    permission: "clinic.consent.check",
    description: "Check whether a patient has active consent for a purpose. Audited as a check.",
  },
];
