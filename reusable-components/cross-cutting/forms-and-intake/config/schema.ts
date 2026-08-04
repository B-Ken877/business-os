/**
 * Configuration schema for forms-and-intake.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on fields per form. */
  readonly maxFieldsPerForm: number;
  /** Cap on submissions stored per form. */
  readonly maxSubmissionsPerForm: number;
}
