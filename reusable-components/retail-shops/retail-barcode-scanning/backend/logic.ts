/**
 * Business logic for the retail-barcode-scanning component.
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
  Barcode,
} from "./types";

import {
  type RegisterBarcodeInput,
  validateRegisterBarcodeInput,
  type LookupBarcodeInput,
  validateLookupBarcodeInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface RetailBarcodeScanningStore {
  getBarcode(tenantId: string, id: EntityId): Barcode | undefined;
  putBarcode(tenantId: string, entity: Barcode): void;
  listBarcodes(tenantId: string): readonly Barcode[];
  deleteBarcode(tenantId: string, id: EntityId): boolean;
}

export class InMemoryRetailBarcodeScanningStore implements RetailBarcodeScanningStore {
  private readonly barcodes = new Map<string, Map<string, Barcode>>();

  getBarcode(tenantId: string, id: EntityId): Barcode | undefined {
    return this.barcodes.get(tenantId)?.get(id);
  }
  putBarcode(tenantId: string, entity: Barcode): void {
    let byId = this.barcodes.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.barcodes.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listBarcodes(tenantId: string): readonly Barcode[] {
    const byId = this.barcodes.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteBarcode(tenantId: string, id: EntityId): boolean {
    return this.barcodes.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: RetailBarcodeScanningStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly allowUnknownBarcodeCreate: boolean;
}

//////////////////////////////////////////////////////////////////////
// registerBarcode — Register a barcode against a product. A barcode can be registered to at most one product per tenant.
//////////////////////////////////////////////////////////////////////
export function registerBarcode(
  ctx: TenantContext,
  deps: Dependencies,
  input: RegisterBarcodeInput
): Result<Barcode> {
  deps.permissions.require(ctx, asPermission("retail.barcodes.register"));
  const validated = validateRegisterBarcodeInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Uniqueness: a barcode can map to at most one product per tenant.
    const existing = deps.store.listBarcodes(ctx.tenantId);
    const conflict = existing.find((b) => b.code === v.code);
    if (conflict) {
      if (conflict.productId === v.productId) {
        return err(ErrorCode.BUSINESS_RULE_VIOLATION, "barcode already registered to this product");
      }
      return err(ErrorCode.CONFLICT, "barcode already registered to another product");
    }
    const id = asEntityId("bar_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const barcode: Barcode = {
      id,
      tenantId: ctx.tenantId,
      code: v.code,
      format: v.format,
      productId: v.productId,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putBarcode(ctx.tenantId, barcode);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "retail-barcode-scanning",
      action: "retail.barcode.registered",
      entityType: "barcode",
      entityId: id,
      details: { code: v.code, format: v.format, productId: v.productId },
    }));
    return ok(barcode);
}

//////////////////////////////////////////////////////////////////////
// lookupBarcode — Resolve a scanned barcode string to a product. Returns NOT_FOUND if the barcode is not registered.
//////////////////////////////////////////////////////////////////////
export function lookupBarcode(
  ctx: TenantContext,
  deps: Dependencies,
  input: LookupBarcodeInput
): Result<Barcode> {
  deps.permissions.require(ctx, asPermission("retail.barcodes.lookup"));
  const validated = validateLookupBarcodeInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const all = deps.store.listBarcodes(ctx.tenantId);
    const found = all.find((b) => b.code === v.code);
    if (!found) {
      return err(ErrorCode.NOT_FOUND, "barcode not registered");
    }
    return ok(found);
}
