/**
 * Configuration schema for clinic-reminders.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default minutes before the event to send a reminder. */
  readonly defaultReminderLeadMinutes: number;
}
