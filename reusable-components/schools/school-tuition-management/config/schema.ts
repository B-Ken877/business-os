/**
 * Configuration schema for school-tuition-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default number of installments. */
  readonly defaultPlanInstallments: number;
}
