/**
 * Configuration schema for retail-product-catalog.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Hard cap on products per tenant. */
  readonly maxProductsPerTenant: number;
  /** Hard cap on categories per tenant. */
  readonly maxCategoriesPerTenant: number;
  /** Default currency for new product prices. */
  readonly defaultCurrency: string;
}
