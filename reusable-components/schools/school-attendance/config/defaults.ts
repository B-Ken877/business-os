/**
 * Default configuration for school-attendance.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  chronicAbsenceThresholdPct: 20,
};
