/**
 * Configuration schema for service-scheduling.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default working start hour. */
  readonly defaultWorkingStartHour: number;
  /** Default working end hour. */
  readonly defaultWorkingEndHour: number;
}
