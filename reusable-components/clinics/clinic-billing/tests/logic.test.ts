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
  InMemoryClinicBillingStore,
  generateInvoice,
  markInvoicePaid,
  defaultConfig,
  type Invoice,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicBillingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.billing.generate",
    "clinic.billing.read",
    "clinic.billing.record_payment",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-billing / generateInvoice", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      generateInvoice(ctx, denyDeps, { patientId: "ent_test", amountCents: 1, currency: "value", appointmentId: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-billing / markInvoicePaid", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markInvoicePaid(ctx, denyDeps, { invoiceId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-billing / generate + pay rules", () => {
  it("generates and pays an invoice", () => {
    const { ctx, deps } = setup();
    const i = generateInvoice(ctx, deps, { patientId: "ent_p1", amountCents: 5000, currency: "HTG" });
    expect(isOk(i)).toBe(true);
    if (!i.ok) return;
    const p = markInvoicePaid(ctx, deps, { invoiceId: i.value.id });
    expect(isOk(p)).toBe(true);
    if (!p.ok) return;
    expect(p.value.status).toBe("paid");
  });
  it("rejects paying an already-paid invoice", () => {
    const { ctx, deps } = setup();
    const i = generateInvoice(ctx, deps, { patientId: "ent_p1", amountCents: 5000, currency: "HTG" });
    if (!i.ok) throw new Error("setup failed");
    markInvoicePaid(ctx, deps, { invoiceId: i.value.id });
    const r = markInvoicePaid(ctx, deps, { invoiceId: i.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
