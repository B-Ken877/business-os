/**
 * Domain types for the retail-barcode-scanning component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Barcode
//////////////////////////////////////////////////////////////////////
/** A barcode registered against a product. */
export interface Barcode {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The barcode string (EAN, UPC, QR, etc.). */
  readonly code: string;
  /** Detected format (ean13, upc, qr, etc.). */
  readonly format: string;
  /** The product this barcode resolves to. */
  readonly productId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
