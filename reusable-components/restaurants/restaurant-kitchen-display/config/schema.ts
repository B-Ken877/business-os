/**
 * Configuration schema for restaurant-kitchen-display.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on open tickets per station. */
  readonly maxTicketsPerStation: number;
}
