/**
 * Default configuration for school-tuition-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultPlanInstallments: 10,
};
