/**
 * Configuration schema for restaurant-delivery-management.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Cap on simultaneous deliveries per driver. */
  readonly maxActiveDeliveriesPerDriver: number;
}
