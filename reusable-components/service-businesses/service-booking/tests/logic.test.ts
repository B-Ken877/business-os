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
  InMemoryServiceBookingStore,
  createBooking,
  markCompleted,
  markNoShow,
  defaultConfig,
  type Booking,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryServiceBookingStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "service.bookings.create",
    "service.bookings.read",
    "service.bookings.update_status",
    "service.bookings.cancel",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("service-booking / createBooking", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createBooking(ctx, denyDeps, { customerId: "ent_test", serviceId: "ent_test", staffUserId: "value", scheduledAt: "2024-01-15", durationMinutes: 1 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-booking / markCompleted", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markCompleted(ctx, denyDeps, { bookingId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-booking / markNoShow", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      markNoShow(ctx, denyDeps, { bookingId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("service-booking / create + status rules", () => {
  it("creates a booking and marks it completed", () => {
    const { ctx, deps } = setup();
    const b = createBooking(ctx, deps, {
      customerId: "ent_c1", serviceId: "ent_s1", staffUserId: "u-1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    expect(isOk(b)).toBe(true);
    if (!b.ok) return;
    const c = markCompleted(ctx, deps, { bookingId: b.value.id });
    expect(isOk(c)).toBe(true);
  });
  it("detects staff conflicts", () => {
    const { ctx, deps } = setup();
    createBooking(ctx, deps, {
      customerId: "ent_c1", serviceId: "ent_s1", staffUserId: "u-1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    const r = createBooking(ctx, deps, {
      customerId: "ent_c2", serviceId: "ent_s1", staffUserId: "u-1",
      scheduledAt: "2024-06-01T10:15:00Z", durationMinutes: 30,
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
  it("rejects completing a non-confirmed booking", () => {
    const { ctx, deps } = setup();
    const b = createBooking(ctx, deps, {
      customerId: "ent_c1", serviceId: "ent_s1", staffUserId: "u-1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    if (!b.ok) throw new Error("setup failed");
    markCompleted(ctx, deps, { bookingId: b.value.id });
    const r = markCompleted(ctx, deps, { bookingId: b.value.id });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("BUSINESS_RULE_VIOLATION");
  });
  it("marks a no-show", () => {
    const { ctx, deps } = setup();
    const b = createBooking(ctx, deps, {
      customerId: "ent_c1", serviceId: "ent_s1", staffUserId: "u-1",
      scheduledAt: "2024-06-01T10:00:00Z", durationMinutes: 30,
    });
    if (!b.ok) throw new Error("setup failed");
    const r = markNoShow(ctx, deps, { bookingId: b.value.id });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.status).toBe("no_show");
  });
});
