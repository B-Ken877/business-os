/**
 * Domain types for the payments-or-collections component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Payment
//////////////////////////////////////////////////////////////////////
/** A recorded payment. */
export interface Payment {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Amount paid, in the smallest currency unit (e.g. centimes). */
  readonly amount: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Payment method. */
  readonly method: string;
  /** Transaction id from the payment provider (required for non-cash). */
  readonly providerReference: string | null;
  /** Invoice this payment is attached to, or null. */
  readonly invoiceId: string | null;
  /** Name of the payer, for record-keeping. */
  readonly payerName: string | null;
  /** Payment status. */
  readonly status: string;
  /** ISO-8601 timestamp of refund, or null. */
  readonly refundedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
