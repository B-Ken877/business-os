/**
 * Configuration schema for school-attendance.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Absent percentage above which a student is flagged chronic. */
  readonly chronicAbsenceThresholdPct: number;
}
