/**
 * Default configuration for church-attendance.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  declineThresholdWeeks: 3,
};
