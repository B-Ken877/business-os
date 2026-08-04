/**
 * Configuration schema for clinic-consent.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Whether revocation requires a reason. */
  readonly requireExplicitRevokeReason: boolean;
}
