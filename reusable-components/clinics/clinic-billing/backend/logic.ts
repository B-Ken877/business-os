/**
 * Business logic for the clinic-billing component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  Invoice,
} from "./types";

import {
  type GenerateInvoiceInput,
  validateGenerateInvoiceInput,
  type MarkInvoicePaidInput,
  validateMarkInvoicePaidInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ClinicBillingStore {
  getInvoice(tenantId: string, id: EntityId): Invoice | undefined;
  putInvoice(tenantId: string, entity: Invoice): void;
  listInvoices(tenantId: string): readonly Invoice[];
  deleteInvoice(tenantId: string, id: EntityId): boolean;
}

export class InMemoryClinicBillingStore implements ClinicBillingStore {
  private readonly invoices = new Map<string, Map<string, Invoice>>();

  getInvoice(tenantId: string, id: EntityId): Invoice | undefined {
    return this.invoices.get(tenantId)?.get(id);
  }
  putInvoice(tenantId: string, entity: Invoice): void {
    let byId = this.invoices.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.invoices.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listInvoices(tenantId: string): readonly Invoice[] {
    const byId = this.invoices.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteInvoice(tenantId: string, id: EntityId): boolean {
    return this.invoices.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ClinicBillingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultConsultationFeeCents: number;
  readonly defaultCurrency: string;
}

//////////////////////////////////////////////////////////////////////
// generateInvoice — Generate an invoice for a patient visit.
//////////////////////////////////////////////////////////////////////
export function generateInvoice(
  ctx: TenantContext,
  deps: Dependencies,
  input: GenerateInvoiceInput
): Result<Invoice> {
  deps.permissions.require(ctx, asPermission("clinic.billing.generate"));
  const validated = validateGenerateInvoiceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("inv_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const invoice: Invoice = {
      id, tenantId: ctx.tenantId, patientId: v.patientId,
      appointmentId: v.appointmentId ?? null, amountCents: v.amountCents,
      currency: v.currency, status: "open", createdAt: now, updatedAt: now,
    };
    deps.store.putInvoice(ctx.tenantId, invoice);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-billing",
      action: "clinic.invoice.generated", entityType: "invoice", entityId: id,
      details: { patientId: v.patientId, amountCents: v.amountCents, currency: v.currency },
    }));
    return ok(invoice);
}

//////////////////////////////////////////////////////////////////////
// markInvoicePaid — Mark an invoice as paid.
//////////////////////////////////////////////////////////////////////
export function markInvoicePaid(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkInvoicePaidInput
): Result<Invoice> {
  deps.permissions.require(ctx, asPermission("clinic.billing.record_payment"));
  const validated = validateMarkInvoicePaidInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.invoiceId);
    const existing = deps.store.getInvoice(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "invoice not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "open") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only open invoices can be marked paid");
    }
    const updated: Invoice = {
      ...existing, status: "paid", updatedAt: new Date().toISOString(),
    };
    deps.store.putInvoice(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "clinic-billing",
      action: "clinic.invoice.paid", entityType: "invoice", entityId: id,
      details: { amountCents: existing.amountCents },
    }));
    return ok(updated);
}
