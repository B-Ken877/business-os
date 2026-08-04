/**
 * Default configuration for church-member-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultDirectoryVisibility: "visible",
  maxMembersPerTenant: 50000,
};
