/**
 * Configuration schema for retail-barcode-scanning.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Whether scanning an unknown barcode can trigger product creation. */
  readonly allowUnknownBarcodeCreate: boolean;
}
