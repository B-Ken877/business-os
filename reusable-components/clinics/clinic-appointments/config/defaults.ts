/**
 * Default configuration for clinic-appointments.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  slotDurationMinutes: 30,
  reminderLeadMinutes: 60,
};
