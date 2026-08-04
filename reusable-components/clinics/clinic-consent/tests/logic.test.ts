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
  InMemoryClinicConsentStore,
  grantConsent,
  revokeConsent,
  hasActiveConsent,
  defaultConfig,
  type ConsentRecord,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryClinicConsentStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "clinic.consent.manage",
    "clinic.consent.read",
    "clinic.consent.check",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("clinic-consent / grantConsent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      grantConsent(ctx, denyDeps, { patientId: "ent_test", purpose: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-consent / revokeConsent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      revokeConsent(ctx, denyDeps, { patientId: "ent_test", purpose: "value", reason: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-consent / hasActiveConsent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      hasActiveConsent(ctx, denyDeps, { patientId: "ent_test", purpose: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("clinic-consent / grant + revoke + check rules", () => {
  it("grants, checks, and revokes consent", () => {
    const { ctx, deps } = setup();
    const g = grantConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    expect(isOk(g)).toBe(true);
    const c1 = hasActiveConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    expect(isOk(c1)).toBe(true);
    if (!c1.ok) return;
    expect(c1.value).toBe(true);
    const r = revokeConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment", reason: "patient request" });
    expect(isOk(r)).toBe(true);
    const c2 = hasActiveConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    expect(isOk(c2)).toBe(true);
    if (!c2.ok) return;
    expect(c2.value).toBe(false);
  });
  it("rejects re-granting active consent", () => {
    const { ctx, deps } = setup();
    grantConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    const r = grantConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("rejects revoking without a reason when configured", () => {
    const { ctx, deps } = setup();
    grantConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    const r = revokeConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects revoking non-existent consent", () => {
    const { ctx, deps } = setup();
    const r = revokeConsent(ctx, deps, { patientId: "ent_p1", purpose: "treatment", reason: "x" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("NOT_FOUND");
  });
});
