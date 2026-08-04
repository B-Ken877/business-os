/**
 * Default configuration for activity-timeline.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxEventsPerEntity: 10000,
  summaryMaxLength: 500,
};
