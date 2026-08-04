/**
 * Configuration schema for service-feedback.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Rating threshold for 'good' feedback. */
  readonly minRatingForGood: number;
}
