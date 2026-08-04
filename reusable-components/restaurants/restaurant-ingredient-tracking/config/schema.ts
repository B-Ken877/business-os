/**
 * Configuration schema for restaurant-ingredient-tracking.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default low-ingredient threshold. */
  readonly defaultLowIngredientThreshold: number;
}
