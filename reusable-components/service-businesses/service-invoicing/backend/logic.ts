/**
 * Business logic for the service-invoicing component.
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
  type MarkPaidInput,
  validateMarkPaidInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceInvoicingStore {
  getInvoice(tenantId: string, id: EntityId): Invoice | undefined;
  putInvoice(tenantId: string, entity: Invoice): void;
  listInvoices(tenantId: string): readonly Invoice[];
  deleteInvoice(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceInvoicingStore implements ServiceInvoicingStore {
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
  readonly store: ServiceInvoicingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultCurrency: string;
  readonly defaultTaxBps: number;
}

//////////////////////////////////////////////////////////////////////
// generateInvoice — Generate an invoice.
//////////////////////////////////////////////////////////////////////
export function generateInvoice(
  ctx: TenantContext,
  deps: Dependencies,
  input: GenerateInvoiceInput
): Result<Invoice> {
  deps.permissions.require(ctx, asPermission("service.invoicing.generate"));
  const validated = validateGenerateInvoiceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const taxCents = Math.floor(v.subtotalCents * deps.config.defaultTaxBps / 10000);
    const totalCents = v.subtotalCents + taxCents;
    const id = asEntityId("inv_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const invoice: Invoice = {
      id, tenantId: ctx.tenantId, customerId: v.customerId,
      bookingId: v.bookingId ?? null, jobId: v.jobId ?? null,
      subtotalCents: v.subtotalCents, taxCents, totalCents,
      currency: v.currency, status: "open",
      createdAt: now, updatedAt: now,
    };
    deps.store.putInvoice(ctx.tenantId, invoice);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-invoicing",
      action: "service.invoice.generated", entityType: "invoice", entityId: id,
      details: { customerId: v.customerId, totalCents },
    }));
    return ok(invoice);
}

//////////////////////////////////////////////////////////////////////
// markPaid — Mark an invoice as paid.
//////////////////////////////////////////////////////////////////////
export function markPaid(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkPaidInput
): Result<Invoice> {
  deps.permissions.require(ctx, asPermission("service.invoicing.record_payment"));
  const validated = validateMarkPaidInput(input);
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
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-invoicing",
      action: "service.invoice.paid", entityType: "invoice", entityId: id,
      details: { totalCents: existing.totalCents },
    }));
    return ok(updated);
}
