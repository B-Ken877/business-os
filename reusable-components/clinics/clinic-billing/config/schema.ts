/**
 * Configuration schema for clinic-billing.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default consultation fee. */
  readonly defaultConsultationFeeCents: number;
  /** Default currency. */
  readonly defaultCurrency: string;
}
