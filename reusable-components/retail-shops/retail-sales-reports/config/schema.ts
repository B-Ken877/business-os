/**
 * Configuration schema for retail-sales-reports.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default N for top-products reports. */
  readonly topN: number;
}
