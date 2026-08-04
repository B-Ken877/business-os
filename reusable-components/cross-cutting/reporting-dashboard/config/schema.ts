/**
 * Configuration schema for reporting-dashboard.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Hard cap on the number of metrics a tenant can define. */
  readonly maxMetricsPerTenant: number;
  /** Default refresh interval (5 minutes). */
  readonly defaultRefreshIntervalSeconds: number;
  /** Maximum days a single query can span. */
  readonly maxQueryWindowDays: number;
}
