/**
 * Default configuration for clinic-prescriptions.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxRefillsAllowed: 3,
};
