/**
 * Configuration schema for service-quotes.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default quote validity days. */
  readonly defaultExpiryDays: number;
}
