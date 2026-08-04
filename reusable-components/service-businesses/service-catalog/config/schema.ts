/**
 * Configuration schema for service-catalog.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default currency. */
  readonly defaultCurrency: string;
  /** Cap on services. */
  readonly maxServicesPerTenant: number;
}
