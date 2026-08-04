/**
 * Configuration schema for restaurant-table-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on tables. */
  readonly maxTablesPerTenant: number;
}
