/**
 * Default configuration for payments-or-collections.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  defaultCurrency: "HTG",
  supportedMethods: ["cash","card","mobile_money","bank_transfer"],
  requireReferenceForNonCash: true,
};
