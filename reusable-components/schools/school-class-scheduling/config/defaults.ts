/**
 * Default configuration for school-class-scheduling.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  sessionDurationMinutes: 45,
};
