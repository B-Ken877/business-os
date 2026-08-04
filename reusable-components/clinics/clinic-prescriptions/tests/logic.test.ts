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
  InMemoryClinicPrescriptionsStore,
  createPrescription,
  refillPrescription,
  defaultConfig,
  type Prescription,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicPrescriptionsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.prescriptions.create",
    "clinic.prescriptions.read",
    "clinic.prescriptions.refill",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-prescriptions / createPrescription", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createPrescription(ctx, denyDeps, { patientId: "ent_test", doctorStaffId: "ent_test", medicationName: "value", dosage: "value", durationDays: 1, refillsRemaining: 0, medicalRecordId: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-prescriptions / refillPrescription", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      refillPrescription(ctx, denyDeps, { prescriptionId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-prescriptions / create + refill rules", () => {
  it("creates and refills a prescription", () => {
    const { ctx, deps } = setup();
    const p = createPrescription(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      medicationName: "Amoxicillin", dosage: "500mg twice daily",
      durationDays: 7, refillsRemaining: 2,
    });
    expect(isOk(p)).toBe(true);
    if (!p.ok) return;
    expect(p.value.status).toBe("active");
    const r1 = refillPrescription(ctx, deps, { prescriptionId: p.value.id });
    expect(isOk(r1)).toBe(true);
    if (!r1.ok) return;
    expect(r1.value.refillsRemaining).toBe(1);
    expect(r1.value.status).toBe("active");
    const r2 = refillPrescription(ctx, deps, { prescriptionId: p.value.id });
    expect(isOk(r2)).toBe(true);
    if (!r2.ok) return;
    expect(r2.value.refillsRemaining).toBe(0);
    expect(r2.value.status).toBe("exhausted");
    const r3 = refillPrescription(ctx, deps, { prescriptionId: p.value.id });
    expect(isErr(r3)).toBe(true);
    if (!r3.ok) expect(r3.error.code).toBe("LIMIT_EXCEEDED");
  });
});
