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
  InMemorySearchAndFilterStore,
  runQuery,
  saveQuery,
  defaultConfig,
  type SavedQuery,
} from "../backend";

function setup(permissions: string[] = []) {
  const store = new InMemorySearchAndFilterStore();
  const audit = new InMemoryAuditSink();
  const allPerms = [
    "search.query",
  ];
  const checker = new InMemoryPermissionChecker(
    [{ tenantId: "t-1", userId: "u-1", permissions: [...allPerms, ...permissions] }]
  );
  const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
  const deps = { store, audit, permissions: checker, config: defaultConfig };
  return { store, audit, checker, ctx, deps };
}

describe("search-and-filter / runQuery", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      runQuery(ctx, denyDeps, { entityType: "value", queryText: undefined, pageSize: 1, cursor: undefined, sortField: undefined, sortDirection: "asc" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("search-and-filter / saveQuery", () => {
  it("denies without the required permission", () => {
    const { ctx, deps } = setup();
    const denyDeps = { ...deps, permissions: new DenyAllPermissionChecker() };
    expect(() => {
      saveQuery(ctx, denyDeps, { name: "value", entityType: "value", queryText: undefined, sortField: undefined, sortDirection: "asc" });
    }).toThrow(PermissionDeniedError);
  });

});

describe("search-and-filter / runQuery happy path", () => {
  it("paginates a list of records", () => {
    const { ctx, deps } = setup();
    // Seed 25 records.
    for (let i = 0; i < 25; i++) {
      (deps.store as any).listRecords = (() => {
        const records = Array.from({ length: 25 }, (_, k) => ({ id: `r-${k}`, name: `record ${k}` }));
        return () => records;
      })();
    }
    // The above seeding pattern is awkward; instead, override the store directly:
    const store = deps.store as any;
    store.listRecords = (_t: string, _e: string) =>
      Array.from({ length: 25 }, (_, k) => ({ id: `r-${k}`, name: `record ${k}` }));
    const r1 = runQuery(ctx, { ...deps, store } as any, {
      entityType: "customer",
      pageSize: 10,
      sortDirection: "asc",
    });
    expect(isOk(r1)).toBe(true);
    if (!r1.ok) return;
    expect(r1.value.items).toHaveLength(10);
    expect(r1.value.nextCursor).not.toBeNull();
  });

  it("caps page size at the configured maximum", () => {
    const { ctx, deps } = setup();
    const store = deps.store as any;
    store.listRecords = () => Array.from({ length: 200 }, (_, k) => ({ id: `r-${k}` }));
    const r = runQuery(ctx, { ...deps, store } as any, {
      entityType: "customer",
      pageSize: 500,  // exceeds maxPageSize (100)
      sortDirection: "asc",
    });
    expect(isOk(r)).toBe(true);
    if (!r.ok) return;
    expect(r.value.items).toHaveLength(100);  // capped
  });
});
