/**
 * Configuration schema for church-donations.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default currency. */
  readonly defaultCurrency: string;
  /** Whether every donation must designate a fund (tithe, offering, building, etc.). */
  readonly requireFundDesignation: boolean;
}
