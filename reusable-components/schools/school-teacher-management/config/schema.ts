/**
 * Configuration schema for school-teacher-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Maximum teaching hours per week. */
  readonly maxWorkloadHoursPerWeek: number;
}
