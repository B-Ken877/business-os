/**
 * Domain types for the forms-and-intake component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// FormDefinition
//////////////////////////////////////////////////////////////////////
/** A configurable form definition. */
export interface FormDefinition {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** URL-friendly identifier. */
  readonly slug: string;
  /** Human-readable title. */
  readonly title: string;
  /** Longer description shown above the form. */
  readonly description: string | null;
  /** JSON-serialised field definitions. */
  readonly fieldsJson: string;
  /** Form status. */
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

//////////////////////////////////////////////////////////////////////
// FormSubmission
//////////////////////////////////////////////////////////////////////
/** A single submission of a form. */
export interface FormSubmission {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** The form this submission belongs to. */
  readonly formId: string;
  /** JSON-serialised submitted values. */
  readonly valuesJson: string;
  /** User who submitted, or 'anonymous' for public forms. */
  readonly submittedByUserId: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}
