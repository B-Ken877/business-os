/**
 * Configuration schema for clinic-staff-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on staff records. */
  readonly maxStaffPerTenant: number;
}
