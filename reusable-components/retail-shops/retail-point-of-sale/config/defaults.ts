/**
 * Default configuration for retail-point-of-sale.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultTaxRateBps: 1000,
  currency: "HTG",
  allowNegativeCartTotal: false,
};
