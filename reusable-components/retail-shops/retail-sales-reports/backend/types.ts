/**
 * Domain types for the retail-sales-reports component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// SaleRecord
//////////////////////////////////////////////////////////////////////
/** A read-only mirror of a Sale record owned by retail-point-of-sale. This component consumes sale records to compute reports; it does not own the canonical Sale entity. */
export interface SaleRecord {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Final amount the customer paid. */
  readonly totalCents: number;
  /** Total discount applied. */
  readonly discountCents: number;
  /** Tax amount. */
  readonly taxCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Sale status (must be 'completed' to count in reports). */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// DailySalesSummary
//////////////////////////////////////////////////////////////////////
/** Daily sales summary. */
export interface DailySalesSummary {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** ISO-8601 date the summary covers. */
  readonly date: string;
  /** Number of sales. */
  readonly totalSalesCount: number;
  /** Sum of sale totals. */
  readonly totalRevenueCents: number;
  /** Sum of discounts. */
  readonly totalDiscountCents: number;
  /** Sum of tax. */
  readonly totalTaxCents: number;
  /** Average sale total. */
  readonly averageBasketCents: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
