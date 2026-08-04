/**
 * Default configuration for clinic-medical-records.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxNotesLengthChars: 20000,
};
