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
  InMemoryRestaurantShiftManagementStore,
  createShift,
  addHandoffNotes,
  defaultConfig,
  type Shift,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantShiftManagementStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.shifts.manage",
    "restaurant.shifts.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-shift-management / createShift", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createShift(ctx, denyDeps, { staffUserId: "value", startsAt: "2024-01-15", endsAt: "2024-01-15", role: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-shift-management / addHandoffNotes", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      addHandoffNotes(ctx, denyDeps, { shiftId: "ent_test", notes: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-shift-management / create + handoff rules", () => {
  it("creates a shift and appends handoff notes", () => {
    const { ctx, deps } = setup();
    const s = createShift(ctx, deps, {
      staffUserId: "u-1", startsAt: "2024-01-01T08:00:00Z",
      endsAt: "2024-01-01T16:00:00Z", role: "server",
    });
    expect(isOk(s)).toBe(true);
    if (!s.ok) return;
    const r = addHandoffNotes(ctx, deps, { shiftId: s.value.id, notes: "Fridge temp high" });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.handoffNotes).toContain("Fridge temp high");
  });
  it("rejects shifts with startsAt >= endsAt", () => {
    const { ctx, deps } = setup();
    const r = createShift(ctx, deps, {
      staffUserId: "u-1", startsAt: "2024-01-01T16:00:00Z",
      endsAt: "2024-01-01T08:00:00Z", role: "server",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("INVALID_INPUT");
  });
});
