/**
 * Business logic for the service-quotes component.
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
  Quote,
} from "./types";

import {
  type CreateQuoteInput,
  validateCreateQuoteInput,
  type ApproveQuoteInput,
  validateApproveQuoteInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface ServiceQuotesStore {
  getQuote(tenantId: string, id: EntityId): Quote | undefined;
  putQuote(tenantId: string, entity: Quote): void;
  listQuotes(tenantId: string): readonly Quote[];
  deleteQuote(tenantId: string, id: EntityId): boolean;
}

export class InMemoryServiceQuotesStore implements ServiceQuotesStore {
  private readonly quotes = new Map<string, Map<string, Quote>>();

  getQuote(tenantId: string, id: EntityId): Quote | undefined {
    return this.quotes.get(tenantId)?.get(id);
  }
  putQuote(tenantId: string, entity: Quote): void {
    let byId = this.quotes.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.quotes.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listQuotes(tenantId: string): readonly Quote[] {
    const byId = this.quotes.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteQuote(tenantId: string, id: EntityId): boolean {
    return this.quotes.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: ServiceQuotesStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultExpiryDays: number;
}

//////////////////////////////////////////////////////////////////////
// createQuote — Create a new quote in draft status.
//////////////////////////////////////////////////////////////////////
export function createQuote(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateQuoteInput
): Result<Quote> {
  deps.permissions.require(ctx, asPermission("service.quotes.create"));
  const validated = validateCreateQuoteInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    try { JSON.parse(v.itemsJson); } catch {
      return err(ErrorCode.INVALID_INPUT, "itemsJson is not valid JSON");
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + deps.config.defaultExpiryDays * 24 * 3600 * 1000).toISOString();
    const id = asEntityId("qt_" + Math.random().toString(36).slice(2, 10));
    const quote: Quote = {
      id, tenantId: ctx.tenantId, customerName: v.customerName,
      customerPhone: v.customerPhone ?? null, itemsJson: v.itemsJson,
      totalCents: v.totalCents, currency: v.currency, expiresAt,
      status: "draft", createdAt: now.toISOString(), updatedAt: now.toISOString(),
    };
    deps.store.putQuote(ctx.tenantId, quote);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-quotes",
      action: "service.quote.created", entityType: "quote", entityId: id,
      details: { customerName: v.customerName, totalCents: v.totalCents },
    }));
    return ok(quote);
}

//////////////////////////////////////////////////////////////////////
// approveQuote — Approve a quote. Only drafts can be approved.
//////////////////////////////////////////////////////////////////////
export function approveQuote(
  ctx: TenantContext,
  deps: Dependencies,
  input: ApproveQuoteInput
): Result<Quote> {
  deps.permissions.require(ctx, asPermission("service.quotes.approve"));
  const validated = validateApproveQuoteInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.quoteId);
    const existing = deps.store.getQuote(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "quote not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "draft" && existing.status !== "sent") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only draft or sent quotes can be approved");
    }
    // Check expiry.
    if (new Date(existing.expiresAt).getTime() < Date.now()) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "quote has expired");
    }
    const updated: Quote = {
      ...existing, status: "approved", updatedAt: new Date().toISOString(),
    };
    deps.store.putQuote(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "service-quotes",
      action: "service.quote.approved", entityType: "quote", entityId: id, details: {},
    }));
    return ok(updated);
}
