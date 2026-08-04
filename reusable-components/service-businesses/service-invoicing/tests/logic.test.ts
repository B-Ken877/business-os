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
  InMemoryServiceInvoicingStore,
  generateInvoice,
  markPaid,
  defaultConfig,
  type Invoice,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceInvoicingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.invoicing.generate",
    "service.invoicing.read",
    "service.invoicing.record_payment",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-invoicing / generateInvoice", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      generateInvoice(ctx, denyDeps, { customerId: "ent_test", subtotalCents: 0, currency: "value", bookingId: undefined, jobId: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-invoicing / markPaid", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markPaid(ctx, denyDeps, { invoiceId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-invoicing / generate + pay rules", () => {
  it("generates and pays an invoice with tax", () => {
    const { ctx, deps } = setup();
    const i = generateInvoice(ctx, deps, {
      customerId: "ent_c1", subtotalCents: 10000, currency: "HTG",
    });
    expect(isOk(i)).toBe(true);
    if (!i.ok) return;
    // 10% tax on 10000 = 1000; total = 11000.
    expect(i.value.taxCents).toBe(1000);
    expect(i.value.totalCents).toBe(11000);
    const p = markPaid(ctx, deps, { invoiceId: i.value.id });
    expect(isOk(p)).toBe(true);
    if (!p.ok) return;
    expect(p.value.status).toBe("paid");
  });
  it("rejects paying an already-paid invoice", () => {
    const { ctx, deps } = setup();
    const i = generateInvoice(ctx, deps, { customerId: "ent_c1", subtotalCents: 1000, currency: "HTG" });
    if (!i.ok) throw new Error("setup failed");
    markPaid(ctx, deps, { invoiceId: i.value.id });
    const r = markPaid(ctx, deps, { invoiceId: i.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
