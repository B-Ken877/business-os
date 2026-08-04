/**
 * Default configuration for service-scheduling.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultWorkingStartHour: 9,
  defaultWorkingEndHour: 17,
};
