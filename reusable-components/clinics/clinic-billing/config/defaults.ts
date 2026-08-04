/**
 * Default configuration for clinic-billing.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultConsultationFeeCents: 5000,
  defaultCurrency: "HTG",
};
