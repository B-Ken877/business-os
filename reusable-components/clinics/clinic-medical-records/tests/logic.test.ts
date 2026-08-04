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
  InMemoryClinicMedicalRecordsStore,
  createRecord,
  listRecordsForPatient,
  defaultConfig,
  type MedicalRecord,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicMedicalRecordsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.records.create",
    "clinic.records.read",
    "clinic.records.update",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-medical-records / createRecord", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createRecord(ctx, denyDeps, { patientId: "ent_test", doctorStaffId: "ent_test", consultationNotes: "value", diagnosis: undefined, treatmentPlan: undefined, appointmentId: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-medical-records / listRecordsForPatient", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listRecordsForPatient(ctx, denyDeps, { patientId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-medical-records / create + list rules", () => {
  it("creates records and lists them for a patient, with audit", () => {
    const { ctx, deps, audit } = setup();
    createRecord(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      consultationNotes: "Patient presents with fever.",
    });
    createRecord(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      consultationNotes: "Follow-up: fever resolved.",
    });
    createRecord(ctx, deps, {
      patientId: "ent_p2", doctorStaffId: "ent_d1",
      consultationNotes: "Other patient.",
    });
    const r = listRecordsForPatient(ctx, deps, { patientId: "ent_p1" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(2);
    // Audit: 2 creates + 1 list.
    const listAudits = audit.filter((e) => e.action === "clinic.records.listed_for_patient");
    expect(listAudits).toHaveLength(1);
  });
  it("rejects notes that are too long", () => {
    const { ctx, deps } = setup();
    const r = createRecord(ctx, deps, {
      patientId: "ent_p1", doctorStaffId: "ent_d1",
      consultationNotes: "x".repeat(20001),
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("LIMIT_EXCEEDED");
  });
});
