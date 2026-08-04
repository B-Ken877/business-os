/**
 * Configuration schema for payments-or-collections.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default currency code (ISO 4217). */
  readonly defaultCurrency: string;
  /** Payment methods accepted. */
  readonly supportedMethods: ReadonlyArray<string>;
  /** Whether non-cash payments must include a provider transaction reference. */
  readonly requireReferenceForNonCash: boolean;
}
