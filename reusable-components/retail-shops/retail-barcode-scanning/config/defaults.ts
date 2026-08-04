/**
 * Default configuration for retail-barcode-scanning.
 * Tenants override individual keys; keys not overridden fall back to
 * these values.
 */
import type { ComponentConfig } from "./schema";

export const defaultConfig: ComponentConfig = {
  allowUnknownBarcodeCreate: false,
};
