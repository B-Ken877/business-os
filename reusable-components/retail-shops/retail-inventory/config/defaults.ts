/**
 * Default configuration for retail-inventory.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultLowStockThreshold: 5,
  allowNegativeStock: false,
  maxMovementsPerProduct: 10000,
};
