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
  InMemoryClinicPatientManagementStore,
  createPatient,
  getPatient,
  defaultConfig,
  type Patient,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicPatientManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.patients.create",
    "clinic.patients.read",
    "clinic.patients.update",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-patient-management / createPatient", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createPatient(ctx, denyDeps, { firstName: "value", lastName: "value", dateOfBirth: "2024-01-15", medicalRecordNumber: "value", phone: undefined, email: undefined, address: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-patient-management / getPatient", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      getPatient(ctx, denyDeps, { patientId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-patient-management / create + read rules", () => {
  it("creates and reads a patient, with audit on read", () => {
    const { ctx, deps, audit } = setup();
    const p = createPatient(ctx, deps, {
      firstName: "Jean", lastName: "Baptiste", dateOfBirth: "1980-01-01",
      medicalRecordNumber: "MRN-001",
    });
    expect(isOk(p)).toBe(true);
    if (!p.ok) return;
    const r = getPatient(ctx, deps, { patientId: p.value.id });
    expect(isOk(r)).toBe(true);
    // Audit should have BOTH a create and a read entry.
    const createAudits = audit.filter((e) => e.action === "clinic.patient.created");
    const readAudits = audit.filter((e) => e.action === "clinic.patient.read");
    expect(createAudits).toHaveLength(1);
    expect(readAudits).toHaveLength(1);
  });
  it("rejects duplicate medical record numbers", () => {
    const { ctx, deps } = setup();
    createPatient(ctx, deps, { firstName: "A", lastName: "B", dateOfBirth: "1980-01-01", medicalRecordNumber: "X" });
    const r = createPatient(ctx, deps, { firstName: "C", lastName: "D", dateOfBirth: "1980-01-01", medicalRecordNumber: "X" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
  it("returns NOT_FOUND for non-existent patients", () => {
    const { ctx, deps } = setup();
    const r = getPatient(ctx, deps, { patientId: "ent_missing" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});
