/**
 * Domain types for the search-and-filter component.
 *
 * These types are the canonical contract. If documentation and
 * types disagree, the types win.
 */

import type { EntityId, TenantId } from "@business-os/shared";

//////////////////////////////////////////////////////////////////////
// SavedQuery
//////////////////////////////////////////////////////////////////////
/** A named, persisted query a user can re-run. */
export interface SavedQuery {
  readonly id: EntityId;
  readonly tenantId: TenantId;
  /** Human-readable name for the saved query. */
  readonly name: string;
  /** The kind of entity this query targets. */
  readonly entityType: string;
  /** Free-text search query. */
  readonly queryText: string | null;
  /** JSON-serialised filter clauses. */
  readonly filtersJson: string | null;
  /** Field to sort by. */
  readonly sortField: string | null;
  /** Sort direction. */
  readonly sortDirection: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface QueryResult {
  readonly items: ReadonlyArray<Record<string, unknown>>;
  readonly nextCursor: string | null;
}

export interface GenericRecordStore {
  listRecords(tenantId: string, entityType: string): ReadonlyArray<Record<string, unknown>>;
  putSavedQuery(tenantId: string, sq: SavedQuery): void;
  getSavedQuery(tenantId: string, id: import("@business-os/shared").EntityId): SavedQuery | undefined;
  listSavedQueries(tenantId: string): readonly SavedQuery[];
  deleteSavedQuery(tenantId: string, id: import("@business-os/shared").EntityId): boolean;
}
