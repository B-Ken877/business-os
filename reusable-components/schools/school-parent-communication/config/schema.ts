/**
 * Configuration schema for school-parent-communication.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on broadcasts per hour. */
  readonly broadcastRateLimitPerHour: number;
}
