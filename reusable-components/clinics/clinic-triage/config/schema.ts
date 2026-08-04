/**
 * Configuration schema for clinic-triage.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Whether emergency triage automatically triggers a notification. */
  readonly emergencyAutoNotify: boolean;
}
