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
  InMemorySchoolTuitionManagementStore,
  createTuitionPlan,
  recordTuitionPayment,
  computeOutstandingBalance,
  defaultConfig,
  type TuitionPlan,
  type TuitionPayment,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolTuitionManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.tuition.manage",
    "school.tuition.read",
    "school.tuition.record_payment",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-tuition-management / createTuitionPlan", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createTuitionPlan(ctx, denyDeps, { studentId: "ent_test", totalAmountCents: 1, currency: "value", installmentsJson: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-tuition-management / recordTuitionPayment", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordTuitionPayment(ctx, denyDeps, { planId: "ent_test", amountCents: 1, currency: "value", paymentReference: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-tuition-management / computeOutstandingBalance", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      computeOutstandingBalance(ctx, denyDeps, { planId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-tuition-management / plan + payment rules", () => {
  it("creates a plan, records payments, and computes the balance", () => {
    const { ctx, deps } = setup();
    const plan = createTuitionPlan(ctx, deps, {
      studentId: "ent_s1", totalAmountCents: 100000, currency: "HTG",
      installmentsJson: JSON.stringify([
        { dueDate: "2024-09-01", amountCents: 50000 },
        { dueDate: "2025-01-01", amountCents: 50000 },
      ]),
    });
    expect(isOk(plan)).toBe(true);
    if (!plan.ok) return;
    recordTuitionPayment(ctx, deps, { planId: plan.value.id, amountCents: 30000, currency: "HTG" });
    const bal = computeOutstandingBalance(ctx, deps, { planId: plan.value.id });
    expect(isOk(bal)).toBe(true);
    if (!bal.ok) return;
    expect(bal.value.totalAmountCents).toBe(100000);
    expect(bal.value.paidAmountCents).toBe(30000);
    expect(bal.value.outstandingCents).toBe(70000);
  });
  it("rejects plans where installments do not sum to total", () => {
    const { ctx, deps } = setup();
    const r = createTuitionPlan(ctx, deps, {
      studentId: "ent_s1", totalAmountCents: 100000, currency: "HTG",
      installmentsJson: JSON.stringify([{ dueDate: "2024-09-01", amountCents: 50000 }]),
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("rejects overpayment", () => {
    const { ctx, deps } = setup();
    const plan = createTuitionPlan(ctx, deps, {
      studentId: "ent_s1", totalAmountCents: 100000, currency: "HTG",
      installmentsJson: JSON.stringify([{ dueDate: "2024-09-01", amountCents: 100000 }]),
    });
    if (!plan.ok) throw new Error("setup failed");
    recordTuitionPayment(ctx, deps, { planId: plan.value.id, amountCents: 80000, currency: "HTG" });
    const r = recordTuitionPayment(ctx, deps, { planId: plan.value.id, amountCents: 30000, currency: "HTG" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("rejects duplicate plans for the same student", () => {
    const { ctx, deps } = setup();
    createTuitionPlan(ctx, deps, {
      studentId: "ent_s1", totalAmountCents: 100000, currency: "HTG",
      installmentsJson: JSON.stringify([{ dueDate: "2024-09-01", amountCents: 100000 }]),
    });
    const r = createTuitionPlan(ctx, deps, {
      studentId: "ent_s1", totalAmountCents: 50000, currency: "HTG",
      installmentsJson: JSON.stringify([{ dueDate: "2024-09-01", amountCents: 50000 }]),
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
});
