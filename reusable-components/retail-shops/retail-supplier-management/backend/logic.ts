/**
 * Business logic for the retail-supplier-management component.
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
  Supplier,
  PurchaseOrder,
} from "./types";

import {
  type CreateSupplierInput,
  validateCreateSupplierInput,
  type CreatePurchaseOrderInput,
  validateCreatePurchaseOrderInput,
  type MarkPurchaseOrderReceivedInput,
  validateMarkPurchaseOrderReceivedInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailSupplierManagementStore {
  getSupplier(tenantId: string, id: EntityId): Supplier | undefined;
  putSupplier(tenantId: string, entity: Supplier): void;
  listSuppliers(tenantId: string): readonly Supplier[];
  deleteSupplier(tenantId: string, id: EntityId): boolean;
  getPurchaseOrder(tenantId: string, id: EntityId): PurchaseOrder | undefined;
  putPurchaseOrder(tenantId: string, entity: PurchaseOrder): void;
  listPurchaseOrders(tenantId: string): readonly PurchaseOrder[];
  deletePurchaseOrder(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailSupplierManagementStore implements RetailSupplierManagementStore {
  private readonly suppliers = new Map<string, Map<string, Supplier>>();
  private readonly purchaseOrders = new Map<string, Map<string, PurchaseOrder>>();

  getSupplier(tenantId: string, id: EntityId): Supplier | undefined {
    return this.suppliers.get(tenantId)?.get(id);
  }
  putSupplier(tenantId: string, entity: Supplier): void {
    let byId = this.suppliers.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.suppliers.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listSuppliers(tenantId: string): readonly Supplier[] {
    const byId = this.suppliers.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteSupplier(tenantId: string, id: EntityId): boolean {
    return this.suppliers.get(tenantId)?.delete(id) ?? false;
  }

  getPurchaseOrder(tenantId: string, id: EntityId): PurchaseOrder | undefined {
    return this.purchaseOrders.get(tenantId)?.get(id);
  }
  putPurchaseOrder(tenantId: string, entity: PurchaseOrder): void {
    let byId = this.purchaseOrders.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.purchaseOrders.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listPurchaseOrders(tenantId: string): readonly PurchaseOrder[] {
    const byId = this.purchaseOrders.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deletePurchaseOrder(tenantId: string, id: EntityId): boolean {
    return this.purchaseOrders.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailSupplierManagementStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultPaymentTermsDays: number;
}

//////////////////////////////////////////////////////////////////////
// createSupplier — Create a new supplier record.
//////////////////////////////////////////////////////////////////////
export function createSupplier(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreateSupplierInput
): Result<Supplier> {
  deps.permissions.require(ctx, asPermission("retail.suppliers.manage"));
  const validated = validateCreateSupplierInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("sup_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const supplier: Supplier = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      contactName: v.contactName ?? null,
      phone: v.phone ?? null,
      email: v.email ?? null,
      address: v.address ?? null,
      paymentTermsDays: v.paymentTermsDays,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putSupplier(ctx.tenantId, supplier);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-supplier-management",
      action: "retail.supplier.created",
      entityType: "supplier",
      entityId: id,
      details: { name: v.name, paymentTermsDays: v.paymentTermsDays },
    }));
    return ok(supplier);
}

//////////////////////////////////////////////////////////////////////
// createPurchaseOrder — Create a new purchase order for a supplier.
//////////////////////////////////////////////////////////////////////
export function createPurchaseOrder(
  ctx: TenantContext,
  deps: Dependencies,
  input: CreatePurchaseOrderInput
): Result<PurchaseOrder> {
  deps.permissions.require(ctx, asPermission("retail.purchaseorders.create"));
  const validated = validateCreatePurchaseOrderInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const supplier = deps.store.getSupplier(ctx.tenantId, asEntityId(v.supplierId));
    if (!supplier) {
      return err(ErrorCode.NOT_FOUND, "supplier not found");
    }
    try {
      const parsed = JSON.parse(v.itemsJson);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return err(ErrorCode.INVALID_INPUT, "items must be a non-empty array");
      }
    } catch {
      return err(ErrorCode.INVALID_INPUT, "itemsJson is not valid JSON");
    }
    const id = asEntityId("po_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const po: PurchaseOrder = {
      id,
      tenantId: ctx.tenantId,
      supplierId: v.supplierId,
      itemsJson: v.itemsJson,
      totalCents: v.totalCents,
      currency: v.currency,
      status: "open",
      receivedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putPurchaseOrder(ctx.tenantId, po);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-supplier-management",
      action: "retail.po.created",
      entityType: "purchase_order",
      entityId: id,
      details: { supplierId: v.supplierId, totalCents: v.totalCents, currency: v.currency },
    }));
    return ok(po);
}

//////////////////////////////////////////////////////////////////////
// markPurchaseOrderReceived — Mark a PO as received. The actual stock increment is delegated to retail-inventory.
//////////////////////////////////////////////////////////////////////
export function markPurchaseOrderReceived(
  ctx: TenantContext,
  deps: Dependencies,
  input: MarkPurchaseOrderReceivedInput
): Result<PurchaseOrder> {
  deps.permissions.require(ctx, asPermission("retail.purchaseorders.receive"));
  const validated = validateMarkPurchaseOrderReceivedInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId(v.purchaseOrderId);
    const existing = deps.store.getPurchaseOrder(ctx.tenantId, id);
    if (!existing) {
      return err(ErrorCode.NOT_FOUND, "purchase order not found");
    }
    assertSameTenant(ctx, existing.tenantId);
    if (existing.status !== "open") {
      return err(ErrorCode.BUSINESS_RULE_VIOLATION, "only open POs can be marked received");
    }
    const updated: PurchaseOrder = {
      ...existing,
      status: "received",
      receivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deps.store.putPurchaseOrder(ctx.tenantId, updated);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-supplier-management",
      action: "retail.po.received",
      entityType: "purchase_order",
      entityId: id,
      details: {},
    }));
    return ok(updated);
}
