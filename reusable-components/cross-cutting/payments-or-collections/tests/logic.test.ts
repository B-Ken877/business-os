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
  InMemoryPaymentsOrCollectionsStore,
  recordPayment,
  refundPayment,
  listPaymentsForInvoice,
  defaultConfig,
  type Payment,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryPaymentsOrCollectionsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "payments.record",
    "payments.read",
    "payments.refund",
    "payments.reconcile",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("payments-or-collections / recordPayment", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordPayment(ctx, denyDeps, { amount: 1, currency: "value", method: "cash", providerReference: undefined, invoiceId: undefined, payerName: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("payments-or-collections / refundPayment", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      refundPayment(ctx, denyDeps, { paymentId: "ent_test", reason: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("payments-or-collections / listPaymentsForInvoice", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listPaymentsForInvoice(ctx, denyDeps, { invoiceId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("payments-or-collections / recordPayment happy path", () => {
  it("records a cash payment", () => {
    const { ctx, deps } = setup();
    const r = recordPayment(ctx, deps, {
      amount: 5000,
      currency: "HTG",
      method: "cash",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("recorded");
  });

  it("requires providerReference for non-cash payments when configured", () => {
    const { ctx, deps } = setup();
    const r = recordPayment(ctx, deps, {
      amount: 5000,
      currency: "HTG",
      method: "card",
      // no providerReference
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });

  it("accepts non-cash payments with a providerReference", () => {
    const { ctx, deps } = setup();
    const r = recordPayment(ctx, deps, {
      amount: 5000,
      currency: "HTG",
      method: "mobile_money",
      providerReference: "moncash-tx-123",
    });
    expect(isOk(r)).toBe(true);
  });
});

describe("payments-or-collections / refundPayment rules", () => {
  it("refunds a recorded payment", () => {
    const { ctx, deps } = setup();
    const p = recordPayment(ctx, deps, { amount: 5000, currency: "HTG", method: "cash" });
    if (!p.ok) throw new Error("setup failed");
    const r = refundPayment(ctx, deps, { paymentId: p.value.id, reason: "customer dispute" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("refunded");
  });

  it("rejects double-refund", () => {
    const { ctx, deps } = setup();
    const p = recordPayment(ctx, deps, { amount: 5000, currency: "HTG", method: "cash" });
    if (!p.ok) throw new Error("setup failed");
    refundPayment(ctx, deps, { paymentId: p.value.id, reason: "first" });
    const r2 = refundPayment(ctx, deps, { paymentId: p.value.id, reason: "second" });
    expect(isErr(r2)).toBe(true);
    if (!r2.ok) expect(r2.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
