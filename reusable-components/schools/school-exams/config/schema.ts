/**
 * Configuration schema for school-exams.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default exam window length. */
  readonly defaultExamWindowDays: number;
}
