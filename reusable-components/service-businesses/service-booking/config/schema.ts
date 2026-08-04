/**
 * Configuration schema for service-booking.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Slot granularity for conflict detection. */
  readonly slotGranularityMinutes: number;
}
