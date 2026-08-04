/**
 * Default configuration for notifications-center.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultExpiryHours: 168,
  maxPerUser: 1000,
};
