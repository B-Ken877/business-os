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
  InMemoryChurchDonationsStore,
  recordDonation,
  computeMemberGivingTotal,
  defaultConfig,
  type Donation,
  type Pledge,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchDonationsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.donations.record",
    "church.donations.read",
    "church.donations.read_member_history",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-donations / recordDonation", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordDonation(ctx, denyDeps, { memberId: "value", amountCents: 1, currency: "value", fund: "value", method: "cash", paymentReference: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-donations / computeMemberGivingTotal", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      computeMemberGivingTotal(ctx, denyDeps, { memberId: "value", fromDate: "2024-01-15", toDate: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-donations / record + compute rules", () => {
  it("records donations and computes a member total", () => {
    const { ctx, deps } = setup();
    recordDonation(ctx, deps, { memberId: "ent_m1", amountCents: 5000, currency: "HTG", fund: "tithe", method: "cash" });
    recordDonation(ctx, deps, { memberId: "ent_m1", amountCents: 3000, currency: "HTG", fund: "offering", method: "cash" });
    recordDonation(ctx, deps, { memberId: "ent_m2", amountCents: 1000, currency: "HTG", fund: "tithe", method: "cash" });
    // Use a wide date range that includes "now".
    const r = computeMemberGivingTotal(ctx, deps, { memberId: "ent_m1", fromDate: "2000-01-01", toDate: "2099-12-31" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.totalCents).toBe(8000);
    expect(r.value.donationCount).toBe(2);
  });
  it("requires paymentReference for non-cash donations", () => {
    const { ctx, deps } = setup();
    const r = recordDonation(ctx, deps, {
      memberId: "ent_m1", amountCents: 5000, currency: "HTG", fund: "tithe",
      method: "mobile_money",  // no paymentReference
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
