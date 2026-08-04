/**
 * Default configuration for church-sermons.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxSermonsPerTenant: 10000,
};
