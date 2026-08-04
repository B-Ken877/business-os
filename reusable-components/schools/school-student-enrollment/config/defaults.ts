/**
 * Default configuration for school-student-enrollment.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxStudentsPerTenant: 10000,
};
