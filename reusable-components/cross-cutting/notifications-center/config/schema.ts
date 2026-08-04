/**
 * Configuration schema for notifications-center.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Hours after which a notification expires (default 7 days). */
  readonly defaultExpiryHours: number;
  /** Cap on notifications stored per user; oldest are pruned. */
  readonly maxPerUser: number;
}
