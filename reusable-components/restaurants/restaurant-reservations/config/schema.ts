/**
 * Configuration schema for restaurant-reservations.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on reservations per day. */
  readonly maxReservationsPerDay: number;
  /** Minutes before reservation to send a reminder. */
  readonly reminderLeadMinutes: number;
}
