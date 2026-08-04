/**
 * Default configuration for restaurant-reservations.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  maxReservationsPerDay: 200,
  reminderLeadMinutes: 60,
};
