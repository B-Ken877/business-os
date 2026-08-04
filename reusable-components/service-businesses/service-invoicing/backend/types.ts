/**
 * Domain types for the service-invoicing component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Invoice
//////////////////////////////////////////////////////////////////////
/** A service invoice. */
export interface Invoice {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer. */
  readonly customerId: string;
  /** Booking this invoice is for, or null. */
  readonly bookingId: string | null;
  /** Job this invoice is for, or null. */
  readonly jobId: string | null;
  /** Subtotal. */
  readonly subtotalCents: number;
  /** Tax. */
  readonly taxCents: number;
  /** Total. */
  readonly totalCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Invoice status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
