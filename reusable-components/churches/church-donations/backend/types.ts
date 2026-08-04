/**
 * Domain types for the church-donations component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Donation
//////////////////////////////////////////////////////////////////////
/** A single donation. */
export interface Donation {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Donating member (or 'anonymous' for cash). */
  readonly memberId: string;
  /** Donation amount. */
  readonly amountCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Fund designation (tithe, offering, building, etc.). */
  readonly fund: string;
  /** Payment method. */
  readonly method: string;
  /** Reference for non-cash donations. */
  readonly paymentReference: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// Pledge
//////////////////////////////////////////////////////////////////////
/** A member's pledge to donate a target amount. */
export interface Pledge {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Member who pledged. */
  readonly memberId: string;
  /** Pledged amount. */
  readonly targetAmountCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Fund the pledge is for. */
  readonly fund: string;
  /** ISO-8601 date the pledge is due. */
  readonly dueDate: string;
  /** Pledge status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
