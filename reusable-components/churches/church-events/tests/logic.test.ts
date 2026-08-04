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
  InMemoryChurchEventsStore,
  createEvent,
  registerForMember,
  defaultConfig,
  type Event,
  type EventRegistration,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryChurchEventsStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "church.events.manage",
    "church.events.read",
    "church.events.register",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("church-events / createEvent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      createEvent(ctx, denyDeps, { name: "value", startsAt: "2024-01-15", endsAt: "2024-01-15", location: undefined, capacity: 0 });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-events / registerForMember", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      registerForMember(ctx, denyDeps, { eventId: "ent_test", memberId: "value" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("church-events / create + register rules", () => {
  it("creates an event and registers a member", () => {
    const { ctx, deps } = setup();
    const e = createEvent(ctx, deps, {
      name: "Easter Service", startsAt: "2024-04-01T10:00:00Z",
      endsAt: "2024-04-01T12:00:00Z", capacity: 100,
    });
    expect(isOk(e)).toBe(true);
    if (!e.ok) return;
    const r = registerForMember(ctx, deps, { eventId: e.value.id, memberId: "ent_m1" });
    expect(isOk(r)).toBe(true);
  });
  it("rejects duplicate registrations", () => {
    const { ctx, deps } = setup();
    const e = createEvent(ctx, deps, {
      name: "X", startsAt: "2024-04-01T10:00:00Z", endsAt: "2024-04-01T12:00:00Z", capacity: 100,
    });
    if (!e.ok) throw new Error("setup failed");
    registerForMember(ctx, deps, { eventId: e.value.id, memberId: "ent_m1" });
    const r = registerForMember(ctx, deps, { eventId: e.value.id, memberId: "ent_m1" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("CONFLICT");
  });
  it("enforces capacity", () => {
    const { ctx, deps } = setup();
    const e = createEvent(ctx, deps, {
      name: "Small", startsAt: "2024-04-01T10:00:00Z", endsAt: "2024-04-01T12:00:00Z", capacity: 1,
    });
    if (!e.ok) throw new Error("setup failed");
    registerForMember(ctx, deps, { eventId: e.value.id, memberId: "ent_m1" });
    const r = registerForMember(ctx, deps, { eventId: e.value.id, memberId: "ent_m2" });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("LIMIT_EXCEEDED");
  });
});
