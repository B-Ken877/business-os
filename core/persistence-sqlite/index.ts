/**
 * Public barrel for the SQLite persistence adapter.
 *
 * Consumers (the HTTP server, integration tests) import from here.
 */

export { openDatabase } from "./database";
export type { SqliteOptions, DatabaseType } from "./database";

// Core stores (identity, organizations, authorization, audit-log).
export { SqliteIdentityStore } from "./stores/identity-store";
export { SqliteOrganizationsStore } from "./stores/organizations-store";
export { SqliteAuthorizationStore } from "./stores/authorization-store";
export { SqliteAuditLogStore } from "./stores/audit-log-store";

// Restaurant vertical stores (10 components).
export {
  SqliteRestaurantMenuStore,
  SqliteRestaurantOrderManagementStore,
  SqliteRestaurantTableManagementStore,
  SqliteRestaurantKitchenDisplayStore,
  SqliteRestaurantReservationsStore,
  SqliteRestaurantDeliveryManagementStore,
  SqliteRestaurantIngredientTrackingStore,
  SqliteRestaurantBillingStore,
  SqliteRestaurantShiftManagementStore,
  SqliteRestaurantPromotionsStore,
} from "./stores/restaurants";

/**
 * Convenience: create all 4 core stores from a single database connection.
 */
import type { DatabaseType } from "./database";
import { SqliteIdentityStore } from "./stores/identity-store";
import { SqliteOrganizationsStore } from "./stores/organizations-store";
import { SqliteAuthorizationStore } from "./stores/authorization-store";
import { SqliteAuditLogStore } from "./stores/audit-log-store";

export function createStores(db: DatabaseType) {
  return {
    identity: new SqliteIdentityStore(db),
    organizations: new SqliteOrganizationsStore(db),
    authorization: new SqliteAuthorizationStore(db),
    auditLog: new SqliteAuditLogStore(db),
  };
}

/**
 * Convenience: create all 10 restaurant component stores from a single
 * database connection.
 */
import {
  SqliteRestaurantMenuStore,
  SqliteRestaurantOrderManagementStore,
  SqliteRestaurantTableManagementStore,
  SqliteRestaurantKitchenDisplayStore,
  SqliteRestaurantReservationsStore,
  SqliteRestaurantDeliveryManagementStore,
  SqliteRestaurantIngredientTrackingStore,
  SqliteRestaurantBillingStore,
  SqliteRestaurantShiftManagementStore,
  SqliteRestaurantPromotionsStore,
} from "./stores/restaurants";

export function createRestaurantStores(db: DatabaseType) {
  return {
    "restaurant-menu": new SqliteRestaurantMenuStore(db),
    "restaurant-order-management": new SqliteRestaurantOrderManagementStore(db),
    "restaurant-table-management": new SqliteRestaurantTableManagementStore(db),
    "restaurant-kitchen-display": new SqliteRestaurantKitchenDisplayStore(db),
    "restaurant-reservations": new SqliteRestaurantReservationsStore(db),
    "restaurant-delivery-management": new SqliteRestaurantDeliveryManagementStore(db),
    "restaurant-ingredient-tracking": new SqliteRestaurantIngredientTrackingStore(db),
    "restaurant-billing": new SqliteRestaurantBillingStore(db),
    "restaurant-shift-management": new SqliteRestaurantShiftManagementStore(db),
    "restaurant-promotions": new SqliteRestaurantPromotionsStore(db),
  };
}
