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
  InMemoryServiceFeedbackStore,
  submitFeedback,
  listNeedsFollowUp,
  defaultConfig,
  type Feedback,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceFeedbackStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.feedback.create",
    "service.feedback.read",
    "service.feedback.respond",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-feedback / submitFeedback", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      submitFeedback(ctx, denyDeps, { customerId: "ent_test", bookingId: "ent_test", rating: 1, comment: undefined });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-feedback / listNeedsFollowUp", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listNeedsFollowUp(ctx, denyDeps);
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-feedback / submit + list rules", () => {
  it("submits feedback and flags low ratings for follow-up", () => {
    const { ctx, deps } = setup();
    const f1 = submitFeedback(ctx, deps, { customerId: "ent_c1", bookingId: "ent_b1", rating: 5 });
    const f2 = submitFeedback(ctx, deps, { customerId: "ent_c2", bookingId: "ent_b2", rating: 2 });
    expect(isOk(f1)).toBe(true);
    expect(isOk(f2)).toBe(true);
    if (!f1.ok || !f2.ok) return;
    expect(f1.value.status).toBe("acknowledged");
    expect(f2.value.status).toBe("needs_followup");
    const r = listNeedsFollowUp(ctx, deps);
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toHaveLength(1);
  });
  it("rejects ratings outside 1-5", () => {
    const { ctx, deps } = setup();
    const r = submitFeedback(ctx, deps, { customerId: "ent_c1", bookingId: "ent_b1", rating: 6 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
  it("rejects duplicate feedback for the same booking", () => {
    const { ctx, deps } = setup();
    submitFeedback(ctx, deps, { customerId: "ent_c1", bookingId: "ent_b1", rating: 5 });
    const r = submitFeedback(ctx, deps, { customerId: "ent_c1", bookingId: "ent_b1", rating: 4 });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
});
