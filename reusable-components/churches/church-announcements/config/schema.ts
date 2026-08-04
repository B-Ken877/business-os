/**
 * Configuration schema for church-announcements.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default days until an announcement expires. */
  readonly defaultExpiryDays: number;
}
