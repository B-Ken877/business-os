/**
 * Default configuration for restaurant-menu.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultCurrency: "HTG",
  maxItemsPerTenant: 1000,
  maxModifiersPerItem: 20,
};
