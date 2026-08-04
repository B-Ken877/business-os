/**
 * Default configuration for restaurant-order-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxItemsPerOrder: 50,
  defaultFulfillmentType: "dine_in",
};
