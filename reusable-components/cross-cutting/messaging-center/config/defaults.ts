/**
 * Default configuration for messaging-center.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultChannel: "in_app",
  maxBroadcastRecipients: 500,
  rateLimitPerMinute: 60,
  retryFailedDeliveries: true,
};
