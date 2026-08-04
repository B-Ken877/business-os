/**
 * Configuration schema for search-and-filter.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default items per page. */
  readonly defaultPageSize: number;
  /** Maximum items per page a caller can request. */
  readonly maxPageSize: number;
  /** Maximum number of filter clauses per query. */
  readonly maxFilterClauses: number;
}
