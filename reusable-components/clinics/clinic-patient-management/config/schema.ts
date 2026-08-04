/**
 * Configuration schema for clinic-patient-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Whether date of birth is required. */
  readonly requireDateOfBirth: boolean;
  /** Cap on patient records. */
  readonly maxPatientsPerTenant: number;
}
