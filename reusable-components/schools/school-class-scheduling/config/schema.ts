/**
 * Configuration schema for school-class-scheduling.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default session duration. */
  readonly sessionDurationMinutes: number;
}
