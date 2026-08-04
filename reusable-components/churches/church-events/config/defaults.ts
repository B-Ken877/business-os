/**
 * Default configuration for church-events.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultCapacity: 200,
  allowOverRegistration: false,
};
