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
  InMemoryClinicLabOrdersStore,
  orderLabTest,
  recordResult,
  defaultConfig,
  type LabOrder,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicLabOrdersStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.lab.order",
    "clinic.lab.read",
    "clinic.lab.record_result",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-lab-orders / orderLabTest", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      orderLabTest(ctx, denyDeps, { patientId: "ent_test", doctorStaffId: "ent_test", testName: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-lab-orders / recordResult", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordResult(ctx, denyDeps, { labOrderId: "ent_test", resultDocumentId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-lab-orders / order + result rules", () => {
  it("orders a test and records a result", () => {
    const { ctx, deps } = setup();
    const o = orderLabTest(ctx, deps, { patientId: "ent_p1", doctorStaffId: "ent_d1", testName: "CBC" });
    expect(isOk(o)).toBe(true);
    if (!o.ok) return;
    expect(o.value.status).toBe("ordered");
    const r = recordResult(ctx, deps, { labOrderId: o.value.id, resultDocumentId: "ent_doc1" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("completed");
    expect(r.value.resultDocumentId).toBe("ent_doc1");
  });
  it("rejects recording a result for an already-completed order", () => {
    const { ctx, deps } = setup();
    const o = orderLabTest(ctx, deps, { patientId: "ent_p1", doctorStaffId: "ent_d1", testName: "CBC" });
    if (!o.ok) throw new Error("setup failed");
    recordResult(ctx, deps, { labOrderId: o.value.id, resultDocumentId: "ent_doc1" });
    const r = recordResult(ctx, deps, { labOrderId: o.value.id, resultDocumentId: "ent_doc2" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
