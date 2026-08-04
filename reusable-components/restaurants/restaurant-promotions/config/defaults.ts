/**
 * Default configuration for restaurant-promotions.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxActiveCoupons: 50,
};
