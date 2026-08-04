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
  InMemoryClinicTriageStore,
  recordTriage,
  listEmergencyTriage,
  defaultConfig,
  type TriageEntry,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicTriageStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.triage.intake",
    "clinic.triage.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-triage / recordTriage", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordTriage(ctx, denyDeps, { patientId: "ent_test", visitReason: "value", symptomsJson: undefined, urgency: "low" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-triage / listEmergencyTriage", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listEmergencyTriage(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-triage / record + list rules", () => {
  it("records triage and lists emergencies", () => {
    const { ctx, deps } = setup();
    recordTriage(ctx, deps, { patientId: "ent_p1", visitReason: "chest pain", urgency: "emergency" });
    recordTriage(ctx, deps, { patientId: "ent_p2", visitReason: "checkup", urgency: "low" });
    const r = listEmergencyTriage(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
    expect(r.value[0].patientId).toBe("ent_p1");
  });
  it("rejects malformed symptomsJson", () => {
    const { ctx, deps } = setup();
    const r = recordTriage(ctx, deps, {
      patientId: "ent_p1", visitReason: "x", symptomsJson: "not json", urgency: "low",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
