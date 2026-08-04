/**
 * Default configuration for forms-and-intake.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxFieldsPerForm: 50,
  maxSubmissionsPerForm: 10000,
};
