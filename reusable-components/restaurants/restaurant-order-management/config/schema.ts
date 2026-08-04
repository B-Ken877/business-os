/**
 * Configuration schema for restaurant-order-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on line items per order. */
  readonly maxItemsPerOrder: number;
  /** Default fulfillment type. */
  readonly defaultFulfillmentType: string;
}
