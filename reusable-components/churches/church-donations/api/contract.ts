/**
 * HTTP-shaped API contract for church-donations.
 *
 * This file declares the routes the component exposes when wired into
 * a runtime. The actual server is not implemented here — this is the
 * contract that a future `api/server.ts` will satisfy.
 */

import type { Result } from "@business-os/shared";
import type { Donation, Pledge } from "../backend/types";
import type { RecordDonationInput, ComputeMemberGivingTotalInput } from "../backend/validation";

export interface RouteContract {
  readonly method: "GET" | "POST" | "PATCH" | "DELETE";
  readonly path: string;
  readonly permission: string;
  readonly description: string;
}

export const routes: readonly RouteContract[] = [
  {
    method: "POST",
    path: "/v1/church-donations/record-donation",
    permission: "church.donations.record",
    description: "Record a new donation.",
  },
  {
    method: "POST",
    path: "/v1/church-donations/compute-member-giving-total",
    permission: "church.donations.read_member_history",
    description: "Compute a member's total giving over a date range. Requires the elevated 'read_member_history' permission because giving history is especially sensitive.",
  },
];
