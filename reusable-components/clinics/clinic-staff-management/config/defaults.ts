/**
 * Default configuration for clinic-staff-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxStaffPerTenant: 500,
};
