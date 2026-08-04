/**
 * Configuration schema for retail-point-of-sale.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default tax rate in basis points (1000 = 10%). */
  readonly defaultTaxRateBps: number;
  /** POS currency. */
  readonly currency: string;
  /** Whether a cart can have a negative total after discounts (forbidden by default). */
  readonly allowNegativeCartTotal: boolean;
}
