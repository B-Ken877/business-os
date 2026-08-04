/**
 * Domain types for the service-quotes component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Quote
//////////////////////////////////////////////////////////////////////
/** A service quote. */
export interface Quote {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Customer name. */
  readonly customerName: string;
  /** Customer phone. */
  readonly customerPhone: string | null;
  /** JSON-serialised line items. */
  readonly itemsJson: string;
  /** Quote total. */
  readonly totalCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** ISO-8601 expiry timestamp. */
  readonly expiresAt: string;
  /** Quote status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
