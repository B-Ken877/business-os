/**
 * Default configuration for search-and-filter.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  maxFilterClauses: 10,
};
