/**
 * Default configuration for restaurant-ingredient-tracking.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultLowIngredientThreshold: 2,
};
