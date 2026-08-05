/**
 * SQLite store implementations for all 10 restaurant components.
 *
 * Each class implements the corresponding component's Store interface,
 * backed by a SQLite table. All data is tenant-scoped — every query
 * filters by tenant_id.
 *
 * Pattern: identical to the core SQLite stores (identity, organizations,
 * authorization, audit-log). Row ↔ domain type conversion via mapper
 * functions; UPSERT via ON CONFLICT(id) DO UPDATE.
 */

import type { DatabaseType } from "../../database";
import type { EntityId, TenantId } from "@business-os/shared";

// Re-export the store interfaces and types so this file is self-contained
// for type-checking.
import type {
  MenuItem,
} from "@business-os/components/restaurants/restaurant-menu/backend";
import type { RestaurantMenuStore } from "@business-os/components/restaurants/restaurant-menu/backend";

import type { Order } from "@business-os/components/restaurants/restaurant-order-management/backend";
import type { RestaurantOrderManagementStore } from "@business-os/components/restaurants/restaurant-order-management/backend";

import type { Table } from "@business-os/components/restaurants/restaurant-table-management/backend";
import type { RestaurantTableManagementStore } from "@business-os/components/restaurants/restaurant-table-management/backend";

import type { KitchenTicket } from "@business-os/components/restaurants/restaurant-kitchen-display/backend";
import type { RestaurantKitchenDisplayStore } from "@business-os/components/restaurants/restaurant-kitchen-display/backend";

import type { Reservation } from "@business-os/components/restaurants/restaurant-reservations/backend";
import type { RestaurantReservationsStore } from "@business-os/components/restaurants/restaurant-reservations/backend";

import type { Delivery } from "@business-os/components/restaurants/restaurant-delivery-management/backend";
import type { RestaurantDeliveryManagementStore } from "@business-os/components/restaurants/restaurant-delivery-management/backend";

import type { Ingredient, Recipe } from "@business-os/components/restaurants/restaurant-ingredient-tracking/backend";
import type { RestaurantIngredientTrackingStore } from "@business-os/components/restaurants/restaurant-ingredient-tracking/backend";

import type { Bill } from "@business-os/components/restaurants/restaurant-billing/backend";
import type { RestaurantBillingStore } from "@business-os/components/restaurants/restaurant-billing/backend";

import type { Shift } from "@business-os/components/restaurants/restaurant-shift-management/backend";
import type { RestaurantShiftManagementStore } from "@business-os/components/restaurants/restaurant-shift-management/backend";

import type { Coupon } from "@business-os/components/restaurants/restaurant-promotions/backend";
import type { RestaurantPromotionsStore } from "@business-os/components/restaurants/restaurant-promotions/backend";

// ============================================================
// Helper: generic CRUD factory
// ============================================================
// All 10 restaurant stores follow the same pattern: get/put/list/delete
// on a single table, scoped by tenant_id. We use a generic helper to
// avoid repeating the same SQL boilerplate 10 times.

interface CrudConfig<T> {
  table: string;
  // Column names in the DB (snake_case).
  columns: readonly string[];
  // Convert a DB row (snake_case) to a domain entity (camelCase).
  fromRow: (row: Record<string, unknown>) => T;
  // Convert a domain entity to DB params (snake_case keys).
  toParams: (tenantId: string, entity: T) => Record<string, unknown>;
}

function makeCrud<T>(db: DatabaseType, config: CrudConfig<T>) {
  const { table, columns, fromRow, toParams } = config;
  const colList = columns.join(", ");
  const paramList = columns.map((c) => `@${c}`).join(", ");
  const updateList = columns
    .filter((c) => c !== "id" && c !== "created_at")
    .map((c) => `${c} = @${c}`)
    .join(", ");

  return {
    get(tenantId: string, id: EntityId): T | undefined {
      const row = db.prepare(
        `SELECT ${colList} FROM ${table} WHERE tenant_id = ? AND id = ?`
      ).get(tenantId, id) as Record<string, unknown> | undefined;
      return row ? fromRow(row) : undefined;
    },
    put(tenantId: string, entity: T): void {
      const params = toParams(tenantId, entity);
      db.prepare(
        `INSERT INTO ${table} (${colList}) VALUES (${paramList})
         ON CONFLICT(id) DO UPDATE SET ${updateList}`
      ).run(params);
    },
    list(tenantId: string): readonly T[] {
      const rows = db.prepare(
        `SELECT ${colList} FROM ${table} WHERE tenant_id = ?`
      ).all(tenantId) as Record<string, unknown>[];
      return rows.map(fromRow);
    },
    delete(tenantId: string, id: EntityId): boolean {
      const result = db.prepare(
        `DELETE FROM ${table} WHERE tenant_id = ? AND id = ?`
      ).run(tenantId, id);
      return result.changes > 0;
    },
  };
}

// ============================================================
// restaurant-menu — MenuItem
// ============================================================

const menuItemCrud = (db: DatabaseType) => makeCrud<MenuItem>(db, {
  table: "restaurant_menu_items",
  columns: ["id", "tenant_id", "name", "description", "category_id", "price_cents", "currency", "modifiers_json", "image_document_id", "available", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId,
    tenantId: r.tenant_id as TenantId,
    name: r.name as string,
    description: (r.description as string | null) ?? null,
    categoryId: r.category_id as string,
    priceCents: r.price_cents as number,
    currency: r.currency as string,
    modifiersJson: (r.modifiers_json as string | null) ?? null,
    imageDocumentId: (r.image_document_id as string | null) ?? null,
    available: r.available === 1,
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, name: e.name, description: e.description,
    category_id: e.categoryId, price_cents: e.priceCents, currency: e.currency,
    modifiers_json: e.modifiersJson, image_document_id: e.imageDocumentId,
    available: e.available ? 1 : 0, created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantMenuStore implements RestaurantMenuStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return menuItemCrud(this.db); }
  getMenuItem(t: string, id: EntityId) { return this.crud.get(t, id); }
  putMenuItem(t: string, e: MenuItem) { this.crud.put(t, e); }
  listMenuItems(t: string) { return this.crud.list(t); }
  deleteMenuItem(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-order-management — Order
// ============================================================

const orderCrud = (db: DatabaseType) => makeCrud<Order>(db, {
  table: "restaurant_orders",
  columns: ["id", "tenant_id", "items_json", "fulfillment_type", "table_id", "delivery_address", "special_instructions", "status", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    itemsJson: r.items_json as string,
    fulfillmentType: r.fulfillment_type as string,
    tableId: (r.table_id as string | null) ?? null,
    deliveryAddress: (r.delivery_address as string | null) ?? null,
    specialInstructions: (r.special_instructions as string | null) ?? null,
    status: r.status as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, items_json: e.itemsJson,
    fulfillment_type: e.fulfillmentType, table_id: e.tableId,
    delivery_address: e.deliveryAddress, special_instructions: e.specialInstructions,
    status: e.status, created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantOrderManagementStore implements RestaurantOrderManagementStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return orderCrud(this.db); }
  getOrder(t: string, id: EntityId) { return this.crud.get(t, id); }
  putOrder(t: string, e: Order) { this.crud.put(t, e); }
  listOrders(t: string) { return this.crud.list(t); }
  deleteOrder(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-table-management — Table
// ============================================================

const tableCrud = (db: DatabaseType) => makeCrud<Table>(db, {
  table: "restaurant_tables",
  columns: ["id", "tenant_id", "label", "seats", "status", "current_order_id", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    label: r.label as string, seats: r.seats as number,
    status: r.status as string,
    currentOrderId: (r.current_order_id as string | null) ?? null,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, label: e.label, seats: e.seats,
    status: e.status, current_order_id: e.currentOrderId,
    created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantTableManagementStore implements RestaurantTableManagementStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return tableCrud(this.db); }
  getTable(t: string, id: EntityId) { return this.crud.get(t, id); }
  putTable(t: string, e: Table) { this.crud.put(t, e); }
  listTables(t: string) { return this.crud.list(t); }
  deleteTable(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-kitchen-display — KitchenTicket
// ============================================================

const kitchenTicketCrud = (db: DatabaseType) => makeCrud<KitchenTicket>(db, {
  table: "restaurant_kitchen_tickets",
  columns: ["id", "tenant_id", "order_id", "items_json", "station", "priority", "status", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    orderId: r.order_id as string, itemsJson: r.items_json as string,
    station: r.station as string, priority: r.priority as number,
    status: r.status as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, order_id: e.orderId, items_json: e.itemsJson,
    station: e.station, priority: e.priority, status: e.status,
    created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantKitchenDisplayStore implements RestaurantKitchenDisplayStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return kitchenTicketCrud(this.db); }
  getKitchenTicket(t: string, id: EntityId) { return this.crud.get(t, id); }
  putKitchenTicket(t: string, e: KitchenTicket) { this.crud.put(t, e); }
  listKitchenTickets(t: string) { return this.crud.list(t); }
  deleteKitchenTicket(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-reservations — Reservation
// ============================================================

const reservationCrud = (db: DatabaseType) => makeCrud<Reservation>(db, {
  table: "restaurant_reservations",
  columns: ["id", "tenant_id", "customer_name", "customer_phone", "party_size", "scheduled_at", "table_id", "status", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    customerName: r.customer_name as string,
    customerPhone: (r.customer_phone as string | null) ?? null,
    partySize: r.party_size as number,
    scheduledAt: r.scheduled_at as string,
    tableId: (r.table_id as string | null) ?? null,
    status: r.status as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, customer_name: e.customerName,
    customer_phone: e.customerPhone, party_size: e.partySize,
    scheduled_at: e.scheduledAt, table_id: e.tableId, status: e.status,
    created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantReservationsStore implements RestaurantReservationsStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return reservationCrud(this.db); }
  getReservation(t: string, id: EntityId) { return this.crud.get(t, id); }
  putReservation(t: string, e: Reservation) { this.crud.put(t, e); }
  listReservations(t: string) { return this.crud.list(t); }
  deleteReservation(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-delivery-management — Delivery
// ============================================================

const deliveryCrud = (db: DatabaseType) => makeCrud<Delivery>(db, {
  table: "restaurant_deliveries",
  columns: ["id", "tenant_id", "order_id", "address", "driver_id", "status", "picked_up_at", "delivered_at", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    orderId: r.order_id as string, address: r.address as string,
    driverId: (r.driver_id as string | null) ?? null,
    status: r.status as string,
    pickedUpAt: (r.picked_up_at as string | null) ?? null,
    deliveredAt: (r.delivered_at as string | null) ?? null,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, order_id: e.orderId, address: e.address,
    driver_id: e.driverId, status: e.status, picked_up_at: e.pickedUpAt,
    delivered_at: e.deliveredAt, created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantDeliveryManagementStore implements RestaurantDeliveryManagementStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return deliveryCrud(this.db); }
  getDelivery(t: string, id: EntityId) { return this.crud.get(t, id); }
  putDelivery(t: string, e: Delivery) { this.crud.put(t, e); }
  listDeliverys(t: string) { return this.crud.list(t); }
  deleteDelivery(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-ingredient-tracking — Ingredient + Recipe (2 entities)
// ============================================================

const ingredientCrud = (db: DatabaseType) => makeCrud<Ingredient>(db, {
  table: "restaurant_ingredients",
  columns: ["id", "tenant_id", "name", "unit", "quantity", "low_threshold", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    name: r.name as string, unit: r.unit as string,
    quantity: r.quantity as number, lowThreshold: r.low_threshold as number,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, name: e.name, unit: e.unit,
    quantity: e.quantity, low_threshold: e.lowThreshold,
    created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

const recipeCrud = (db: DatabaseType) => makeCrud<Recipe>(db, {
  table: "restaurant_recipes",
  columns: ["id", "tenant_id", "menu_item_ingredient_key", "ingredients_json", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    menuItemIngredientKey: r.menu_item_ingredient_key as string,
    ingredientsJson: r.ingredients_json as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, menu_item_ingredient_key: e.menuItemIngredientKey,
    ingredients_json: e.ingredientsJson, created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantIngredientTrackingStore implements RestaurantIngredientTrackingStore {
  constructor(private readonly db: DatabaseType) {}
  // Ingredient
  getIngredient(t: string, id: EntityId) { return ingredientCrud(this.db).get(t, id); }
  putIngredient(t: string, e: Ingredient) { ingredientCrud(this.db).put(t, e); }
  listIngredients(t: string) { return ingredientCrud(this.db).list(t); }
  deleteIngredient(t: string, id: EntityId) { return ingredientCrud(this.db).delete(t, id); }
  // Recipe
  getRecipe(t: string, id: EntityId) { return recipeCrud(this.db).get(t, id); }
  putRecipe(t: string, e: Recipe) { recipeCrud(this.db).put(t, e); }
  listRecipes(t: string) { return recipeCrud(this.db).list(t); }
  deleteRecipe(t: string, id: EntityId) { return recipeCrud(this.db).delete(t, id); }
}

// ============================================================
// restaurant-billing — Bill
// ============================================================

const billCrud = (db: DatabaseType) => makeCrud<Bill>(db, {
  table: "restaurant_bills",
  columns: ["id", "tenant_id", "order_ids_json", "subtotal_cents", "service_charge_cents", "tax_cents", "tip_cents", "total_cents", "currency", "status", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    orderIdsJson: r.order_ids_json as string,
    subtotalCents: r.subtotal_cents as number,
    serviceChargeCents: r.service_charge_cents as number,
    taxCents: r.tax_cents as number, tipCents: r.tip_cents as number,
    totalCents: r.total_cents as number, currency: r.currency as string,
    status: r.status as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, order_ids_json: e.orderIdsJson,
    subtotal_cents: e.subtotalCents, service_charge_cents: e.serviceChargeCents,
    tax_cents: e.taxCents, tip_cents: e.tipCents, total_cents: e.totalCents,
    currency: e.currency, status: e.status,
    created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantBillingStore implements RestaurantBillingStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return billCrud(this.db); }
  getBill(t: string, id: EntityId) { return this.crud.get(t, id); }
  putBill(t: string, e: Bill) { this.crud.put(t, e); }
  listBills(t: string) { return this.crud.list(t); }
  deleteBill(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-shift-management — Shift
// ============================================================

const shiftCrud = (db: DatabaseType) => makeCrud<Shift>(db, {
  table: "restaurant_shifts",
  columns: ["id", "tenant_id", "staff_user_id", "starts_at", "ends_at", "role", "status", "handoff_notes", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    staffUserId: r.staff_user_id as string,
    startsAt: r.starts_at as string, endsAt: r.ends_at as string,
    role: r.role as string, status: r.status as string,
    handoffNotes: (r.handoff_notes as string | null) ?? null,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, staff_user_id: e.staffUserId,
    starts_at: e.startsAt, ends_at: e.endsAt, role: e.role, status: e.status,
    handoff_notes: e.handoffNotes, created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantShiftManagementStore implements RestaurantShiftManagementStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return shiftCrud(this.db); }
  getShift(t: string, id: EntityId) { return this.crud.get(t, id); }
  putShift(t: string, e: Shift) { this.crud.put(t, e); }
  listShifts(t: string) { return this.crud.list(t); }
  deleteShift(t: string, id: EntityId) { return this.crud.delete(t, id); }
}

// ============================================================
// restaurant-promotions — Coupon
// ============================================================

const couponCrud = (db: DatabaseType) => makeCrud<Coupon>(db, {
  table: "restaurant_coupons",
  columns: ["id", "tenant_id", "code", "discount_type", "discount_value", "max_redemptions", "redemption_count", "status", "created_at", "updated_at"],
  fromRow: (r) => ({
    id: r.id as EntityId, tenantId: r.tenant_id as TenantId,
    code: r.code as string, discountType: r.discount_type as string,
    discountValue: r.discount_value as number,
    maxRedemptions: r.max_redemptions as number,
    redemptionCount: r.redemption_count as number,
    status: r.status as string,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }),
  toParams: (tenantId, e) => ({
    id: e.id, tenant_id: tenantId, code: e.code,
    discount_type: e.discountType, discount_value: e.discountValue,
    max_redemptions: e.maxRedemptions, redemption_count: e.redemptionCount,
    status: e.status, created_at: e.createdAt, updated_at: e.updatedAt,
  }),
});

export class SqliteRestaurantPromotionsStore implements RestaurantPromotionsStore {
  constructor(private readonly db: DatabaseType) {}
  private get crud() { return couponCrud(this.db); }
  getCoupon(t: string, id: EntityId) { return this.crud.get(t, id); }
  putCoupon(t: string, e: Coupon) { this.crud.put(t, e); }
  listCoupons(t: string) { return this.crud.list(t); }
  deleteCoupon(t: string, id: EntityId) { return this.crud.delete(t, id); }
}
