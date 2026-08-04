/**
 * Configuration schema for school-grading.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Passing grade percentage. */
  readonly passingGradePct: number;
}
