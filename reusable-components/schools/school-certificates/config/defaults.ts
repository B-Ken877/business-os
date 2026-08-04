/**
 * Default configuration for school-certificates.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  certificateTemplateKey: "default_graduation",
};
