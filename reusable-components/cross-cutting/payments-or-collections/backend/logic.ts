/**
 * Business logic for the payments-or-collections component.
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
  Payment,
} from "./types";

import {
  type RecordPaymentInput,
  validateRecordPaymentInput,
  type RefundPaymentInput,
  validateRefundPaymentInput,
  type ListPaymentsForInvoiceInput,
  validateListPaymentsForInvoiceInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface PaymentsOrCollectionsStore {
  getPayment(tenantId: string, id: EntityId): Payment | undefined;
  putPayment(tenantId: string, entity: Payment): void;
  listPayments(tenantId: string): readonly Payment[];
  deletePayment(tenantId: string, id: EntityId): boolean;
}

export class InMemoryPaymentsOrCollectionsStore implements PaymentsOrCollectionsStore {
  private readonly payments = new Map<string, Map<string, Payment>>();

  getPayment(tenantId: string, id: EntityId): Payment | undefined {
    return this.payments.get(tenantId)?.get(id);
  }
  putPayment(tenantId: string, entity: Payment): void {
    let byId = this.payments.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.payments.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listPayments(tenantId: string): readonly Payment[] {
    const byId = this.payments.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deletePayment(tenantId: string, id: EntityId): boolean {
    return this.payments.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: PaymentsOrCollectionsStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultCurrency: string;
  readonly supportedMethods: ReadonlyArray<string>;
  readonly requireReferenceForNonCash: boolean;
}

//////////////////////////////////////////////////////////////////////
// recordPayment — Record a payment received.
//////////////////////////////////////////////////////////////////////
export function recordPayment(
  ctx: TenantContext,
  deps: Dependencies,
  input: RecordPaymentInput
): Result<Payment> {
  deps.permissions.require(ctx, asPermission("payments.record"));
  const validated = validateRecordPaymentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    if (v.currency !== deps.config.defaultCurrency) {
      // For the first increment, only the default currency is supported.
      return err(ErrorCode.NOT_SUPPORTED, "only the default currency is supported in this increment");
    }
    if (!deps.config.supportedMethods.includes(v.method)) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "payment method not supported");
    }
    if (deps.config.requireReferenceForNonCash && v.method !== "cash") {
      if (!v.providerReference || v.providerReference.trim().length === 0) {
        return err(ErrorCode.INVALID_INPUT, "providerReference is required for non-cash payments");
      }
    }
    const id = asEntityId("pay_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const payment: Payment = {
      id,
      tenantId: ctx.tenantId,
      amount: v.amount,
      currency: v.currency,
      method: v.method,
      providerReference: v.providerReference ?? null,
      invoiceId: v.invoiceId ?? null,
      payerName: v.payerName ?? "",
      status: "recorded",
      refundedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putPayment(ctx.tenantId, payment);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "payments-or-collections",
      action: "payment.recorded",
      entityType: "payment",
      entityId: id,
      details: { amount: v.amount, currency: v.currency, method: v.method, invoiceId: v.invoiceId ?? null },
    }));
    return ok(payment);
}

//////////////////////////////////////////////////////////////////////
// refundPayment — Mark a previously recorded payment as refunded. The actual refund is initiated through the payment provider; this records the result.
//////////////////////////////////////////////////////////////////////
export function refundPayment(
  ctx: TenantContext,
  deps: Dependencies,
  input: RefundPaymentInput
): Result<Payment> {
  deps.permissions.require(ctx, asPermission("payments.refund"));
  const validated = validateRefundPaymentInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.paymentId);
    const existing = deps.store.getPayment(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "payment not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status === "refunded") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "payment already refunded");
    }
    if (existing.method !== "cash" && !existing.providerReference) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "cannot refund a non-cash payment without a provider reference");
    }
    const updated: Payment = {
      ...existing,
      status: "refunded",
      refundedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putPayment(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "payments-or-collections",
      action: "payment.refunded",
      entityType: "payment",
      entityId: id,
      details: { amount: existing.amount, reason: v.reason },
    }));
    return ok(updated);
}

//////////////////////////////////////////////////////////////////////
// listPaymentsForInvoice — List all non-refunded payments attached to an invoice.
//////////////////////////////////////////////////////////////////////
export function listPaymentsForInvoice(
  ctx: TenantContext,
  deps: Dependencies,
  input: ListPaymentsForInvoiceInput
): Result<readonly Payment[]> {
  deps.permissions.require(ctx, asPermission("payments.read"));
  const validated = validateListPaymentsForInvoiceInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listPayments(ctx.tenantId);
    const filtered = all.filter(
      (p) => p.invoiceId === v.invoiceId && p.status !== "refunded"
    );
    return ok(filtered);
}
