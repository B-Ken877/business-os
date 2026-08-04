/**
 * Domain types for the school-tuition-management component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// TuitionPlan
//////////////////////////////////////////////////////////////////////
/** A tuition plan for a student. */
export interface TuitionPlan {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Student this plan is for. */
  readonly studentId: string;
  /** Total tuition for the academic year. */
  readonly totalAmountCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** JSON-serialised installments (dueDate, amountCents). */
  readonly installmentsJson: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// TuitionPayment
//////////////////////////////////////////////////////////////////////
/** A tuition payment. */
export interface TuitionPayment {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The plan this payment is for. */
  readonly planId: string;
  /** Amount paid. */
  readonly amountCents: number;
  /** ISO 4217 currency code. */
  readonly currency: string;
  /** Reference to the payment in payments-or-collections. */
  readonly paymentReference: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
