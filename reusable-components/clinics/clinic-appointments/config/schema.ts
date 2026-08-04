/**
 * Configuration schema for clinic-appointments.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default appointment slot length. */
  readonly slotDurationMinutes: number;
  /** Minutes before appointment to send a reminder. */
  readonly reminderLeadMinutes: number;
}
