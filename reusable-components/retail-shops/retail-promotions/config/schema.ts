/**
 * Configuration schema for retail-promotions.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on simultaneously active promotions. */
  readonly maxActivePromotionsPerTenant: number;
}
