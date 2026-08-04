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
  InMemorySchoolCertificatesStore,
  issueCertificate,
  revokeCertificate,
  defaultConfig,
  type Certificate,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySchoolCertificatesStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "school.certificates.issue",
    "school.certificates.read",
    "school.certificates.revoke",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("school-certificates / issueCertificate", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      issueCertificate(ctx, denyDeps, { studentId: "ent_test", programName: "value", certificateNumber: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-certificates / revokeCertificate", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      revokeCertificate(ctx, denyDeps, { certificateId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("school-certificates / issue + revoke rules", () => {
  it("issues and revokes a certificate", () => {
    const { ctx, deps } = setup();
    const c = issueCertificate(ctx, deps, {
      studentId: "ent_s1", programName: "6th Grade", certificateNumber: "CERT-001",
    });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    expect(c.value.status).toBe("issued");
    const r = revokeCertificate(ctx, deps, { certificateId: c.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("revoked");
  });
  it("rejects duplicate certificate numbers", () => {
    const { ctx, deps } = setup();
    issueCertificate(ctx, deps, { studentId: "ent_s1", programName: "P", certificateNumber: "X" });
    const r = issueCertificate(ctx, deps, { studentId: "ent_s2", programName: "P", certificateNumber: "X" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
});
