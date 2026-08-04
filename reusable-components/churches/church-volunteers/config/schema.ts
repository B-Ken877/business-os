/**
 * Configuration schema for church-volunteers.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Max simultaneous active assignments per volunteer. */
  readonly maxAssignmentsPerVolunteer: number;
}
