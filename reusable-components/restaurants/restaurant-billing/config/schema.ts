/**
 * Configuration schema for restaurant-billing.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default service charge in basis points (0 = none). */
  readonly defaultServiceChargeBps: number;
  /** Default tax rate in basis points (10%). */
  readonly defaultTaxBps: number;
}
