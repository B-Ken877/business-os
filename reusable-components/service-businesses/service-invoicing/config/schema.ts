/**
 * Configuration schema for service-invoicing.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default currency. */
  readonly defaultCurrency: string;
  /** Default tax rate. */
  readonly defaultTaxBps: number;
}
