/**
 * Default configuration for retail-stock-alerts.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  suppressDuplicateHours: 6,
  alertRecipientRole: "manager",
};
