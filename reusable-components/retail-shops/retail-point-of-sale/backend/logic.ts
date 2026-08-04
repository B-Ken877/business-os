/**
 * Business logic for the retail-point-of-sale component.
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
  Sale,
} from "./types";

import {
  type CheckoutInput,
  validateCheckoutInput,
  type GetSaleInput,
  validateGetSaleInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailPointOfSaleStore {
  getSale(tenantId: string, id: EntityId): Sale | undefined;
  putSale(tenantId: string, entity: Sale): void;
  listSales(tenantId: string): readonly Sale[];
  deleteSale(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailPointOfSaleStore implements RetailPointOfSaleStore {
  private readonly sales = new Map<string, Map<string, Sale>>();

  getSale(tenantId: string, id: EntityId): Sale | undefined {
    return this.sales.get(tenantId)?.get(id);
  }
  putSale(tenantId: string, entity: Sale): void {
    let byId = this.sales.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.sales.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listSales(tenantId: string): readonly Sale[] {
    const byId = this.sales.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteSale(tenantId: string, id: EntityId): boolean {
    return this.sales.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailPointOfSaleStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultTaxRateBps: number;
  readonly currency: string;
  readonly allowNegativeCartTotal: boolean;
}

//////////////////////////////////////////////////////////////////////
// checkout — Process a cart: compute totals, record payment, decrement stock, and create a Sale record.
//////////////////////////////////////////////////////////////////////
export function checkout(
  ctx: TenantContext,
  deps: Dependencies,
  input: CheckoutInput
): Result<Sale> {
  deps.permissions.require(ctx, asPermission("retail.pos.checkout"));
  const validated = validateCheckoutInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    let items: ReadonlyArray<{ productId: string; quantity: number; unitPriceCents: number }>;
    try {
      const parsed = JSON.parse(v.itemsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return err(ErrorCode.INVALID_INPUT, "items must be a non-empty array");
      }
      items = parsed;
    } catch {
      return err(ErrorCode.INVALID_INPUT, "itemsJson is not valid JSON");
    }
    // Validate quantities.
    for (const item of items) {
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        return err(ErrorCode.INVALID_INPUT, "each item quantity must be a positive integer");
      }
      if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
        return err(ErrorCode.INVALID_INPUT, "each unitPriceCents must be a non-negative integer");
      }
    }
    const subtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
    const discountCents = v.discountCents;
    if (discountCents > subtotalCents) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "discount cannot exceed subtotal");
    }
    const taxableBase = subtotalCents - discountCents;
    const taxCents = Math.floor(taxableBase * deps.config.defaultTaxRateBps / 10000);
    const totalCents = taxableBase + taxCents;
    if (totalCents < 0 && !deps.config.allowNegativeCartTotal) {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "total cannot be negative");
    }
    const id = asEntityId("sale_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const sale: Sale = {
      id,
      tenantId: ctx.tenantId,
      cartJson: v.itemsJson,
      subtotalCents,
      discountCents,
      taxCents,
      totalCents,
      currency: deps.config.currency,
      paymentId: null,
      receiptDocumentId: null,
      status: "completed",
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putSale(ctx.tenantId, sale);
    // Note: actual stock decrement and payment recording are delegated to
    // retail-inventory and payments-or-collections respectively. Those calls
    // are made by the orchestrator (a future core:workflow module), not here.
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-point-of-sale",
      action: "retail.sale.completed",
      entityType: "sale",
      entityId: id,
      details: { subtotalCents, discountCents, taxCents, totalCents, itemCount: items.length, paymentMethod: v.paymentMethod },
    }));
    return ok(sale);
}

//////////////////////////////////////////////////////////////////////
// getSale — Retrieve a sale by id.
//////////////////////////////////////////////////////////////////////
export function getSale(
  ctx: TenantContext,
  deps: Dependencies,
  input: GetSaleInput
): Result<Sale> {
  deps.permissions.require(ctx, asPermission("retail.pos.read"));
  const validated = validateGetSaleInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.saleId);
    const sale = deps.store.getSale(ctx.tenantId, id);
    if (!sale) {
      return err(ErrorCode.NOT_FOUND, "sale not found");
    }
    assertSameTenant(ctx, sale.tenantId);
    return ok(sale);
}
