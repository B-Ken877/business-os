/**
 * Configuration schema for service-customer-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on customer records. */
  readonly maxCustomersPerTenant: number;
}
