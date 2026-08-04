/**
 * Default configuration for clinic-patient-management.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  requireDateOfBirth: true,
  maxPatientsPerTenant: 100000,
};
