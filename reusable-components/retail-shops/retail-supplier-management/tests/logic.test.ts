import { describe, it, expect, beforeEach } from "vitest";
import {
  createTenantContext,
  InMemoryPermissionChecker,
  DenyAllPermissionChecker,
  InMemoryAuditSink,
  ok,
  err,
  isOk,
  isErr,
  asEntityId,
  asTenantId,
  asUserId,
  asPermission,
  PermissionDeniedError,
} from "@business-os/shared";
import {
  InMemoryRetailSupplierManagementStore,
  createSupplier,
  createPurchaseOrder,
  markPurchaseOrderReceived,
  defaultConfig,
  type Supplier,
  type PurchaseOrder,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRetailSupplierManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "retail.suppliers.manage",
    "retail.suppliers.read",
    "retail.purchaseorders.create",
    "retail.purchaseorders.receive",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("retail-supplier-management / createSupplier", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createSupplier(ctx, denyDeps, { name: "value", contactName: undefined, phone: undefined, email: undefined, address: undefined, paymentTermsDays: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-supplier-management / createPurchaseOrder", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createPurchaseOrder(ctx, denyDeps, { supplierId: "ent_test", itemsJson: "value", totalCents: 0, currency: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-supplier-management / markPurchaseOrderReceived", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markPurchaseOrderReceived(ctx, denyDeps, { purchaseOrderId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("retail-supplier-management / createSupplier + createPurchaseOrder happy path", () => {
  it("creates a supplier and a PO for them", () => {
    const { ctx, deps } = setup();
    const s = createSupplier(ctx, deps, {
      name: "Distributeur S.A.",
      contactName: "Jean",
      phone: "+509 1234",
      paymentTermsDays: 30,
    });
    expect(isOk(s)).toBe(true);
    if (!s.ok) return;
    const po = createPurchaseOrder(ctx, deps, {
      supplierId: s.value.id,
      itemsJson: JSON.stringify([{ productId: "p1", quantity: 10, unitCostCents: 500 }]),
      totalCents: 5000,
      currency: "HTG",
    });
    expect(isOk(po)).toBe(true);
  });

  it("rejects POs for non-existent suppliers", () => {
    const { ctx, deps } = setup();
    const r = createPurchaseOrder(ctx, deps, {
      supplierId: "ent_missing",
      itemsJson: "[]",
      totalCents: 0,
      currency: "HTG",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});

describe("retail-supplier-management / markPurchaseOrderReceived rules", () => {
  it("marks an open PO as received", () => {
    const { ctx, deps } = setup();
    const s = createSupplier(ctx, deps, { name: "S1", paymentTermsDays: 30 });
    if (!s.ok) throw new Error("setup failed");
    const po = createPurchaseOrder(ctx, deps, {
      supplierId: s.value.id,
      itemsJson: JSON.stringify([{ x: 1 }]),
      totalCents: 1000,
      currency: "HTG",
    });
    if (!po.ok) throw new Error("setup failed");
    const r = markPurchaseOrderReceived(ctx, deps, { purchaseOrderId: po.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("received");
    expect(r.value.receivedAt).not.toBeNull();
  });

  it("rejects re-receiving an already received PO", () => {
    const { ctx, deps } = setup();
    const s = createSupplier(ctx, deps, { name: "S1", paymentTermsDays: 30 });
    if (!s.ok) throw new Error("setup failed");
    const po = createPurchaseOrder(ctx, deps, {
      supplierId: s.value.id,
      itemsJson: JSON.stringify([{ x: 1 }]),
      totalCents: 1000,
      currency: "HTG",
    });
    if (!po.ok) throw new Error("setup failed");
    markPurchaseOrderReceived(ctx, deps, { purchaseOrderId: po.value.id });
    const r = markPurchaseOrderReceived(ctx, deps, { purchaseOrderId: po.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
