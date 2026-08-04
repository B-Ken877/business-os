/**
 * Default configuration for church-donations.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultCurrency: "HTG",
  requireFundDesignation: true,
};
