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
  InMemoryActivityTimelineStore,
  recordEvent,
  listEventsForEntity,
  defaultConfig,
  type TimelineEvent,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemoryActivityTimelineStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "timeline.events.record",
    "timeline.events.read",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("activity-timeline / recordEvent", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      recordEvent(ctx, denyDeps, { entityType: "value", entityId: "ent_test", action: "value", summary: "value", occurredAt: "2024-01-15" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("activity-timeline / listEventsForEntity", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      listEventsForEntity(ctx, denyDeps, { entityType: "value", entityId: "ent_test" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("activity-timeline / recordEvent happy path", () => {
  it("records an event and lists it newest-first", () => {
    const { ctx, deps } = setup();
    const r1 = recordEvent(ctx, deps, {
      entityType: "customer",
      entityId: "ent_test",
      action: "payment.recorded",
      summary: "Payment of 5000 HTG recorded",
      occurredAt: "2024-01-01T10:00:00Z",
    });
    expect(isOk(r1)).toBe(true);
    const r2 = recordEvent(ctx, deps, {
      entityType: "customer",
      entityId: "ent_test",
      action: "note.added",
      summary: "Note added by cashier",
      occurredAt: "2024-01-02T10:00:00Z",
    });
    expect(isOk(r2)).toBe(true);
    const list = listEventsForEntity(ctx, deps, { entityType: "customer", entityId: "ent_test" });
    expect(isOk(list)).toBe(true);
    if (!list.ok) return;
    expect(list.value).toHaveLength(2);
    expect(list.value[0].action).toBe("note.added");
  });

  it("rejects summaries that are too long", () => {
    const { ctx, deps } = setup();
    const r = recordEvent(ctx, deps, {
      entityType: "customer",
      entityId: "ent_test",
      action: "x",
      summary: "y".repeat(600),
      occurredAt: "2024-01-01",
    });
    expect(isErr(r)).toBe(true);
    if (!r.ok) expect(r.error.code).toBe("LIMIT_EXCEEDED");
  });
});
