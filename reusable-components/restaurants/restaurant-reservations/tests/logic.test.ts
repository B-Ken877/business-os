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
  InMemoryRestaurantReservationsStore,
  createReservation,
  cancelReservation,
  defaultConfig,
  type Reservation,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryRestaurantReservationsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "restaurant.reservations.create",
    "restaurant.reservations.read",
    "restaurant.reservations.cancel",
    "restaurant.reservations.checkin",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("restaurant-reservations / createReservation", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createReservation(ctx, denyDeps, { customerName: "value", customerPhone: undefined, partySize: 1, scheduledAt: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-reservations / cancelReservation", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      cancelReservation(ctx, denyDeps, { reservationId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("restaurant-reservations / create + cancel happy path", () => {
  it("creates and cancels a reservation", () => {
    const { ctx, deps } = setup();
    const r = createReservation(ctx, deps, {
      customerName: "Jean", partySize: 4, scheduledAt: "2024-02-14T19:00:00Z",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("confirmed");
    const c = cancelReservation(ctx, deps, { reservationId: r.value.id });
    expect(isOk(c)).toBe(true);
    if (!c.ok) return;
    expect(c.value.status).toBe("cancelled");
  });
  it("rejects double cancellation", () => {
    const { ctx, deps } = setup();
    const r = createReservation(ctx, deps, {
      customerName: "J", partySize: 2, scheduledAt: "2024-02-14T19:00:00Z",
    });
    if (!r.ok) throw new Error("setup failed");
    cancelReservation(ctx, deps, { reservationId: r.value.id });
    const c2 = cancelReservation(ctx, deps, { reservationId: r.value.id });
    expect(isErr(c2)).toBe(true);
    if (!c2.ok) expect(c2.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
