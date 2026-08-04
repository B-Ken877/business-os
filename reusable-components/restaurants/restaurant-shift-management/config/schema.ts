/**
 * Configuration schema for restaurant-shift-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Minimum notice for shift changes. */
  readonly minShiftNoticeMinutes: number;
}
