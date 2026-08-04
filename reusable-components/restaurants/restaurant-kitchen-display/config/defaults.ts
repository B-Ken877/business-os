/**
 * Default configuration for restaurant-kitchen-display.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxTicketsPerStation: 50,
};
