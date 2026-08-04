/**
 * Configuration schema for retail-supplier-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default payment terms (days). */
  readonly defaultPaymentTermsDays: number;
}
