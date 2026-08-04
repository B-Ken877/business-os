/**
 * Configuration schema for restaurant-promotions.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on active coupons. */
  readonly maxActiveCoupons: number;
}
