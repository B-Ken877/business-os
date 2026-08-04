/**
 * Configuration schema for service-job-tracking.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on tasks per job. */
  readonly maxTasksPerJob: number;
}
