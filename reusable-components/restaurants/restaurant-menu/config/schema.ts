/**
 * Configuration schema for restaurant-menu.
 * Each tenant may override these values; defaults live in `defaults.ts`.
 */
export interface ComponentConfig {
  /** Default currency for new menu items. */
  readonly defaultCurrency: string;
  /** Cap on menu items. */
  readonly maxItemsPerTenant: number;
  /** Cap on modifiers per item. */
  readonly maxModifiersPerItem: number;
}
