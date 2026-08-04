/**
 * Default configuration for restaurant-shift-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  minShiftNoticeMinutes: 60,
};
