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
  InMemoryClinicStaffManagementStore,
  createStaff,
  listDoctors,
  defaultConfig,
  type Staff,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicStaffManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.staff.manage",
    "clinic.staff.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-staff-management / createStaff", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createStaff(ctx, denyDeps, { firstName: "value", lastName: "value", role: "doctor", specialty: undefined, phone: undefined, email: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-staff-management / listDoctors", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listDoctors(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-staff-management / create + list rules", () => {
  it("creates staff and lists doctors", () => {
    const { ctx, deps } = setup();
    createStaff(ctx, deps, { firstName: "Dr", lastName: "Jean", role: "doctor", specialty: "Cardiology" });
    createStaff(ctx, deps, { firstName: "Marie", lastName: "Joseph", role: "nurse" });
    const r = listDoctors(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
    expect(r.value[0].role).toBe("doctor");
  });
});
