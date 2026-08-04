/**
 * Domain types for the service-catalog component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Service
//////////////////////////////////////////////////////////////////////
/** A service offered by the business. */
export interface Service {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Service name. */
  readonly name: string;
  /** Longer description. */
  readonly description: string | null;
  /** Category. */
  readonly categoryId: string;
  /** Price. */
  readonly priceCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Typical duration. */
  readonly durationMinutes: number;
  /** Service status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
