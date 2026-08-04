/**
 * Domain types for the retail-point-of-sale component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Sale
//////////////////////////////////////////////////////////////////////
/** A completed or in-progress sale. */
export interface Sale {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** JSON-serialised cart (line items + discounts). */
  readonly cartJson: string;
  /** Sum of line items before tax and discounts. */
  readonly subtotalCents: number;
  /** Total discount applied. */
  readonly discountCents: number;
  /** Tax amount. */
  readonly taxCents: number;
  /** Final amount the customer pays. */
  readonly totalCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Reference to the recorded payment (in payments-or-collections). */
  readonly paymentId: string | null;
  /** Document id of the generated receipt. */
  readonly receiptDocumentId: string | null;
  /** Sale status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
