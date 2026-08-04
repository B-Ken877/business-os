/**
 * Default configuration for restaurant-billing.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultServiceChargeBps: 0,
  defaultTaxBps: 1000,
};
