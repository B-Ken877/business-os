/**
 * Default configuration for retail-product-catalog.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxProductsPerTenant: 50000,
  maxCategoriesPerTenant: 200,
  defaultCurrency: "HTG",
};
