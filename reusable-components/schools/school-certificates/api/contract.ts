/**
 * HTTP-shaped API contract for school-certificates.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Certificate } from "../backend/types";
import type { IssueCertificateInput, RevokeCertificateInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/school-certificates/issue-certificate",
    permission: "school.certificates.issue",
    description: "Issue a new certificate to a student.",
  },
  {
    method: "POST",
    path: "/v1/school-certificates/revoke-certificate",
    permission: "school.certificates.revoke",
    description: "Revoke a certificate (e.g. due to academic dishonesty).",
  },
];
