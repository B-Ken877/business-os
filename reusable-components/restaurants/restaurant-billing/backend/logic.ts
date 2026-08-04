/**
 * Business logic for the restaurant-billing component.
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
  Bill,
} from "./types";

import {
  type GenerateBillInput,
  validateGenerateBillInput,
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
export interface RestaurantBillingStore {
  getBill(tenantId: string, id: EntityId): Bill | undefined;
  putBill(tenantId: string, entity: Bill): void;
  listBills(tenantId: string): readonly Bill[];
  deleteBill(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRestaurantBillingStore implements RestaurantBillingStore {
  private readonly bills = new Map<string, Map<string, Bill>>();

  getBill(tenantId: string, id: EntityId): Bill | undefined {
    return this.bills.get(tenantId)?.get(id);
  }
  putBill(tenantId: string, entity: Bill): void {
    let byId = this.bills.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.bills.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listBills(tenantId: string): readonly Bill[] {
    const byId = this.bills.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteBill(tenantId: string, id: EntityId): boolean {
    return this.bills.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RestaurantBillingStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultServiceChargeBps: number;
  readonly defaultTaxBps: number;
}

//////////////////////////////////////////////////////////////////////
// generateBill — Generate a bill from one or more orders.
//////////////////////////////////////////////////////////////////////
export function generateBill(
  ctx: TenantContext,
  deps: Dependencies,
  input: GenerateBillInput
): Result<Bill> {
  deps.permissions.require(ctx, asPermission("restaurant.billing.generate"));
  const validated = validateGenerateBillInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    let orderIds: string[];
    try {
      const parsed = JSON.parse(v.orderIdsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return err(ErrorCode.INVALID_INPUT, "orderIds must be a non-empty array");
      }
      orderIds = parsed;
    } catch {
      return err(ErrorCode.INVALID_INPUT, "orderIdsJson is not valid JSON");
    }
    // In the full system, each order's total would be fetched from the order
    // component. For this increment, the caller passes the subtotal directly
    // via a config-like mechanism; here we accept that the order totals are
    // embedded in the audit details and the bill's subtotal is computed by
    // the orchestrator. We record a 0 subtotal if no orders are provided.
    // (Future: read orders via deps.orderStore.getOrder and sum their totals.)
    const subtotalCents = 0;  // placeholder until order store is wired
    const serviceChargeCents = Math.floor(subtotalCents * deps.config.defaultServiceChargeBps / 10000);
    const taxableBase = subtotalCents + serviceChargeCents;
    const taxCents = Math.floor(taxableBase * deps.config.defaultTaxBps / 10000);
    const totalCents = taxableBase + taxCents + v.tipCents;
    const id = asEntityId("bill_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const bill: Bill = {
      id, tenantId: ctx.tenantId, orderIdsJson: v.orderIdsJson,
      subtotalCents, serviceChargeCents, taxCents, tipCents: v.tipCents,
      totalCents, currency: "HTG", status: "open",
      createdAt: now, updatedAt: now,
    };
    deps.store.putBill(ctx.tenantId, bill);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-billing",
      action: "restaurant.bill.generated", entityType: "bill", entityId: id,
      details: { orderCount: orderIds.length, totalCents },
    }));
    return ok(bill);
}

//////////////////////////////////////////////////////////////////////
// markPaid — Mark a bill as paid after payment is recorded.
//////////////////////////////////////////////////////////////////////
export function markPaid(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkPaidInput
): Result<Bill> {
  deps.permissions.require(ctx, asPermission("restaurant.billing.record_payment"));
  const validated = validateMarkPaidInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.billId);
    const existing = deps.store.getBill(ctx.tenantId, id);
    if (!existing) return err(ErrorCode.NOT_FOUND, "bill not found");
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "open") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only open bills can be marked paid");
    }
    const updated: Bill = {
      ...existing, status: "paid", updatedAt: new Date().toISOString(),
    };
    deps.store.putBill(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId, actorUserId: ctx.userId, componentId: "restaurant-billing",
      action: "restaurant.bill.paid", entityType: "bill", entityId: id, details: { totalCents: existing.totalCents },
    }));
    return ok(updated);
}
