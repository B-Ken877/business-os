/**
 * Configuration schema for school-student-enrollment.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on student records. */
  readonly maxStudentsPerTenant: number;
}
