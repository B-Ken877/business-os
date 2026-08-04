/**
 * Configuration schema for clinic-prescriptions.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default max refills per prescription. */
  readonly maxRefillsAllowed: number;
}
