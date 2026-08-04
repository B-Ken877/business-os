import { describe, it, expect } from "vitest";
import {
  asTenantId,
  asUserId,
  isOk,
  isErr,
  createAuditEntry,
} from "@business-os/shared";
import {
  InMemoryAuditLogStore,
  PersistentAuditSink,
  defaultAuditLogConfig,
  queryAuditLog,
  countAuditEntries,
  recordAuditEntry,
} from "../backend";
import type { Dependencies } from "../backend";

function setup(): Dependencies {
  const store = new InMemoryAuditLogStore();
  return { store, config: defaultAuditLogConfig };
}

describe("audit-log / PersistentAuditSink", () => {
  it("writes entries to the store", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    const entry = createAuditEntry({
      tenantId: asTenantId("t-1"),
      actorUserId: asUserId("u-1"),
      componentId: "retail-inventory",
      action: "stock.adjusted",
      entityType: "stock_level",
      entityId: "ent_1",
    });
    sink.record(entry);
    const r = queryAuditLog(deps, { tenantId: asTenantId("t-1") });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.entries).toHaveLength(1);
    expect(r.value.entries[0].action).toBe("stock.adjusted");
  });
});

describe("audit-log / queryAuditLog", () => {
  it("returns entries scoped to the tenant", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    // Tenant A: 2 entries.
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-a"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "a", entityType: "e", entityId: "1",
    }));
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-a"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "b", entityType: "e", entityId: "2",
    }));
    // Tenant B: 1 entry.
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-b"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "c", entityType: "e", entityId: "3",
    }));
    const r = queryAuditLog(deps, { tenantId: asTenantId("t-a") });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.entries).toHaveLength(2);
    expect(r.value.entries.every((e) => e.tenantId === "t-a")).toBe(true);
  });

  it("filters by componentId, action, entityType, entityId, actorUserId", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
      componentId: "retail-inventory", action: "stock.adjusted",
      entityType: "stock_level", entityId: "ent_1",
    }));
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-2"),
      componentId: "retail-pos", action: "sale.completed",
      entityType: "sale", entityId: "ent_2",
    }));
    const byComponent = queryAuditLog(deps, { tenantId: asTenantId("t-1"), componentId: "retail-inventory" });
    if (!byComponent.ok) throw new Error("fail");
    expect(byComponent.value.entries).toHaveLength(1);

    const byAction = queryAuditLog(deps, { tenantId: asTenantId("t-1"), action: "sale.completed" });
    if (!byAction.ok) throw new Error("fail");
    expect(byAction.value.entries).toHaveLength(1);

    const byActor = queryAuditLog(deps, { tenantId: asTenantId("t-1"), actorUserId: "u-2" });
    if (!byActor.ok) throw new Error("fail");
    expect(byActor.value.entries).toHaveLength(1);

    const byEntity = queryAuditLog(deps, {
      tenantId: asTenantId("t-1"), entityType: "stock_level", entityId: "ent_1",
    });
    if (!byEntity.ok) throw new Error("fail");
    expect(byEntity.value.entries).toHaveLength(1);
  });

  it("filters by date range", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    // Manually create entries with specific timestamps.
    const oldEntry = createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "old", entityType: "e", entityId: "1",
      at: "2024-01-01T00:00:00Z",
    });
    const newEntry = createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "new", entityType: "e", entityId: "2",
      at: "2024-06-01T00:00:00Z",
    });
    sink.record(oldEntry);
    sink.record(newEntry);
    const r = queryAuditLog(deps, {
      tenantId: asTenantId("t-1"),
      fromAt: "2024-05-01",
      toAt: "2024-12-31",
    });
    if (!r.ok) throw new Error("fail");
    expect(r.value.entries).toHaveLength(1);
    expect(r.value.entries[0].action).toBe("new");
  });

  it("paginates with a cursor", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    for (let i = 0; i < 25; i++) {
      sink.record(createAuditEntry({
        tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
        componentId: "x", action: `a${i}`, entityType: "e", entityId: String(i),
      }));
    }
    const r1 = queryAuditLog(deps, { tenantId: asTenantId("t-1"), limit: 10 });
    if (!r1.ok) throw new Error("fail");
    expect(r1.value.entries).toHaveLength(10);
    expect(r1.value.nextCursor).not.toBeNull();
    const r2 = queryAuditLog(deps, {
      tenantId: asTenantId("t-1"), limit: 10, cursor: r1.value.nextCursor!,
    });
    if (!r2.ok) throw new Error("fail");
    expect(r2.value.entries).toHaveLength(10);
  });

  it("returns newest-first", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "first", entityType: "e", entityId: "1",
      at: "2024-01-01T00:00:00Z",
    }));
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
      componentId: "x", action: "second", entityType: "e", entityId: "2",
      at: "2024-06-01T00:00:00Z",
    }));
    const r = queryAuditLog(deps, { tenantId: asTenantId("t-1") });
    if (!r.ok) throw new Error("fail");
    expect(r.value.entries[0].action).toBe("second");
  });

  it("rejects queries without a tenantId", () => {
    const deps = setup();
    const r = queryAuditLog(deps, { tenantId: "" as any });
    expect(isErr(r)).toBe(true);
  });

  it("rejects queries with fromAt > toAt", () => {
    const deps = setup();
    const r = queryAuditLog(deps, {
      tenantId: asTenantId("t-1"),
      fromAt: "2024-06-01",
      toAt: "2024-01-01",
    });
    expect(isErr(r)).toBe(true);
  });
});

describe("audit-log / countAuditEntries", () => {
  it("counts matching entries", () => {
    const deps = setup();
    const sink = new PersistentAuditSink(deps.store);
    for (let i = 0; i < 5; i++) {
      sink.record(createAuditEntry({
        tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
        componentId: "retail-inventory", action: "stock.adjusted",
        entityType: "stock_level", entityId: String(i),
      }));
    }
    sink.record(createAuditEntry({
      tenantId: asTenantId("t-1"), actorUserId: asUserId("u-1"),
      componentId: "retail-pos", action: "sale.completed",
      entityType: "sale", entityId: "x",
    }));
    const r = countAuditEntries(deps, {
      tenantId: asTenantId("t-1"),
      componentId: "retail-inventory",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value).toBe(5);
  });
});

describe("audit-log / recordAuditEntry (direct)", () => {
  it("records an entry directly without going through a component", () => {
    const deps = setup();
    const r = recordAuditEntry(deps, {
      tenantId: asTenantId("t-1"),
      actorUserId: "u-1",
      componentId: "core/http",
      action: "request.completed",
      entityType: "request",
      entityId: "req_1",
      details: { method: "POST", path: "/v1/identity/login" },
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.componentId).toBe("core/http");
    expect(r.value.details.method).toBe("POST");
  });
});

describe("audit-log / immutability", () => {
  it("has no update or delete operations on the store", () => {
    // The AuditLogStore interface exposes only record, list, count.
    // There is intentionally no update() or delete() method.
    // This test exists to prevent accidental additions.
    const store = new InMemoryAuditLogStore();
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(store))
      .filter((m) => m !== "constructor");
    expect(methods).not.toContain("update");
    expect(methods).not.toContain("delete");
    expect(methods).not.toContain("deleteById");
    expect(methods).not.toContain("updateEntry");
  });
});
