/**
 * Default configuration for church-groups.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxGroupsPerTenant: 100,
  defaultMaxMembers: 30,
};
