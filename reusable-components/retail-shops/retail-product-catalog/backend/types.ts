/**
 * Domain types for the retail-product-catalog component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Category
//////////////////////////////////////////////////////////////////////
/** A product category. */
export interface Category {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Category name (unique per tenant). */
  readonly name: string;
  /** Longer description. */
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// Product
//////////////////////////////////////////////////////////////////////
/** A retail product. */
export interface Product {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Product name. */
  readonly name: string;
  /** Stock keeping unit (unique per tenant). */
  readonly sku: string;
  /** The category this product belongs to. */
  readonly categoryId: string;
  /** Price in the smallest currency unit (e.g. centimes). */
  readonly priceCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Longer description. */
  readonly description: string | null;
  /** Document id of the product photo (managed by document-management). */
  readonly photoDocumentId: string | null;
  /** Product status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
