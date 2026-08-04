/**
 * Default configuration for service-booking.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  slotGranularityMinutes: 15,
};
