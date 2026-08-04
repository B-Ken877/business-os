/**
 * Default configuration for clinic-lab-orders.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultResultTurnaroundHours: 24,
};
