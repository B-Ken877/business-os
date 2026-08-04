/**
 * Configuration schema for retail-inventory.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default threshold below which a low-stock alert fires. */
  readonly defaultLowStockThreshold: number;
  /** Whether stock can go below zero (forbidden by default). */
  readonly allowNegativeStock: boolean;
  /** Cap on movement history per product. */
  readonly maxMovementsPerProduct: number;
}
