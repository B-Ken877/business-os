/**
 * Default configuration for school-parent-communication.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  broadcastRateLimitPerHour: 10,
};
