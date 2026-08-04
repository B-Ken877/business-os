/**
 * Domain types for the retail-supplier-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Supplier
//////////////////////////////////////////////////////////////////////
/** A supplier of goods to the shop. */
export interface Supplier {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Supplier name. */
  readonly name: string;
  /** Contact person at the supplier. */
  readonly contactName: string | null;
  /** Phone number. */
  readonly phone: string | null;
  /** Email address. */
  readonly email: string | null;
  /** Physical address. */
  readonly address: string | null;
  /** Number of days the shop has to pay the supplier. */
  readonly paymentTermsDays: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// PurchaseOrder
//////////////////////////////////////////////////////////////////////
/** A purchase order to a supplier. */
export interface PurchaseOrder {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Supplier this PO is for. */
  readonly supplierId: string;
  /** JSON-serialised line items. */
  readonly itemsJson: string;
  /** Total PO value. */
  readonly totalCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** PO status. */
  readonly status: string;
  /** ISO-8601 timestamp the PO was received, or null. */
  readonly receivedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
