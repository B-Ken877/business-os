/**
 * Domain types for the clinic-billing component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Invoice
//////////////////////////////////////////////////////////////////////
/** A clinic invoice. */
export interface Invoice {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Patient. */
  readonly patientId: string;
  /** Appointment this invoice is for, or null. */
  readonly appointmentId: string | null;
  /** Invoice amount. */
  readonly amountCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Invoice status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
