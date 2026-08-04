/**
 * Domain types for the school-certificates component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// Certificate
//////////////////////////////////////////////////////////////////////
/** A completion certificate. */
export interface Certificate {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Student this certificate is for. */
  readonly studentId: string;
  /** Program completed. */
  readonly programName: string;
  /** Unique certificate number (per tenant). */
  readonly certificateNumber: string;
  /** ISO-8601 issue date. */
  readonly issuedAt: string;
  /** Document id of the generated PDF. */
  readonly pdfDocumentId: string | null;
  /** Certificate status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
