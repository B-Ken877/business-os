/**
 * Configuration schema for church-attendance.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Weeks of absence before flagging as declining. */
  readonly declineThresholdWeeks: number;
}
