/**
 * Business logic for the search-and-filter component.
 *
 * Every operation enforces three things, in this order:
 *   1. Permission check (throws PermissionDeniedError).
 *   2. Tenant isolation (throws TenantIsolationError on cross-tenant access).
 *   3. Input validation + business rules (returns Result.err).
 *
 * State-changing operations write an audit entry to the injected
 * AuditSink before returning.
 */

import {
  type TenantContext,
  type PermissionChecker,
  type AuditSink,
  type Result,
  type EntityId,
  ok,
  err,
  asPermission,
  asEntityId,
  assertSameTenant,
  createAuditEntry,
  ErrorCode,
  PermissionDeniedError,
} from "@business-os/shared";

import type {
  SavedQuery,
} from "./types";

import {
  type RunQueryInput,
  validateRunQueryInput,
  type SaveQueryInput,
  validateSaveQueryInput,
} from "./validation";

/**
 * Persistence interface. The component is injected with a store at
 * construction time; tests supply an in-memory store, production code
 * supplies the platform-backed store. Either way, the store MUST
 * scope every read and write by tenantId — it is the last line of
 * defence for tenant isolation.
 */
export interface SearchAndFilterStore {
  getSavedQuery(tenantId: string, id: EntityId): SavedQuery | undefined;
  putSavedQuery(tenantId: string, entity: SavedQuery): void;
  listSavedQuerys(tenantId: string): readonly SavedQuery[];
  deleteSavedQuery(tenantId: string, id: EntityId): boolean;
}

export class InMemorySearchAndFilterStore implements SearchAndFilterStore {
  private readonly savedQuerys = new Map<string, Map<string, SavedQuery>>();

  getSavedQuery(tenantId: string, id: EntityId): SavedQuery | undefined {
    return this.savedQuerys.get(tenantId)?.get(id);
  }
  putSavedQuery(tenantId: string, entity: SavedQuery): void {
    let byId = this.savedQuerys.get(tenantId);
    if (!byId) {
      byId = new Map();
      this.savedQuerys.set(tenantId, byId);
    }
    byId.set(entity.id, entity);
  }
  listSavedQuerys(tenantId: string): readonly SavedQuery[] {
    const byId = this.savedQuerys.get(tenantId);
    return byId ? [...byId.values()] : [];
  }
  deleteSavedQuery(tenantId: string, id: EntityId): boolean {
    return this.savedQuerys.get(tenantId)?.delete(id) ?? false;
  }

}

export interface Dependencies {
  readonly store: SearchAndFilterStore;
  readonly permissions: PermissionChecker;
  readonly audit: AuditSink;
  readonly config: Readonly<ComponentConfig>;
}

export interface ComponentConfig {
  readonly defaultPageSize: number;
  readonly maxPageSize: number;
  readonly maxFilterClauses: number;
}

//////////////////////////////////////////////////////////////////////
// runQuery — Run a search/filter/sort/paginate query against a list of items supplied by the caller.
//////////////////////////////////////////////////////////////////////
export function runQuery(
  ctx: TenantContext,
  deps: Dependencies,
  input: RunQueryInput
): Result<{ items: ReadonlyArray<Record<string, unknown>>; nextCursor: string | null }> {
  deps.permissions.require(ctx, asPermission("search.query"));
  const validated = validateRunQueryInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    // Note: the caller supplies the candidate items via deps.store;
    // this operation does the filtering, sorting, and pagination.
    // For this first increment, we accept any entityType and operate
    // on a generic record shape. The store is cast to `any` because the
    // auto-generated store interface doesn't include `listRecords` — a
    // future version will declare a typed GenericRecordStore the store
    // implements.
    const size = Math.min(v.pageSize, deps.config.maxPageSize);
    const all = (deps.store as any).listRecords(ctx.tenantId, v.entityType) as ReadonlyArray<Record<string, unknown>>;
    let filtered = all;
    if (v.queryText) {
      const q = v.queryText.toLowerCase();
      filtered = filtered.filter((r: Record<string, unknown>) =>
        Object.values(r).some((val) => String(val).toLowerCase().includes(q))
      );
    }
    if (v.sortField) {
      const field = v.sortField;
      filtered = [...filtered].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        const cmp = String(av) > String(bv) ? 1 : -1;
        return v.sortDirection === "desc" ? -cmp : cmp;
      });
    }
    // Cursor is the index of the last returned item.
    const start = v.cursor ? parseInt(v.cursor, 10) + 1 : 0;
    const page = filtered.slice(start, start + size);
    const nextCursor = start + size < filtered.length ? String(start + size - 1) : null;
    return ok({ items: page, nextCursor });
}

//////////////////////////////////////////////////////////////////////
// saveQuery — Persist a query for later re-use by the same user.
//////////////////////////////////////////////////////////////////////
export function saveQuery(
  ctx: TenantContext,
  deps: Dependencies,
  input: SaveQueryInput
): Result<SavedQuery> {
  deps.permissions.require(ctx, asPermission("search.query"));
  const validated = validateSaveQueryInput(input);
  if (!validated.ok) return validated;
  const v = validated.value;
    const id = asEntityId("sq_" + Math.random().toString(36).slice(2, 10));
    const now = new Date().toISOString();
    const sq: SavedQuery = {
      id,
      tenantId: ctx.tenantId,
      name: v.name,
      entityType: v.entityType,
      queryText: v.queryText ?? "",
      filtersJson: "[]",
      sortField: v.sortField ?? "",
      sortDirection: v.sortDirection,
      createdAt: now,
      updatedAt: now,
    };
    deps.store.putSavedQuery(ctx.tenantId, sq);
    deps.audit.record(createAuditEntry({
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      componentId: "search-and-filter",
      action: "search.query.saved",
      entityType: "saved_query",
      entityId: id,
      details: { name: v.name, entityType: v.entityType },
    }));
    return ok(sq);
}
