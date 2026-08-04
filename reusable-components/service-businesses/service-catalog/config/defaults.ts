/**
 * Default configuration for service-catalog.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultCurrency: "HTG",
  maxServicesPerTenant: 1000,
};
