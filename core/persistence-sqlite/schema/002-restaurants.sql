-- Schema for restaurant components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id, id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter, after 001-core.sql.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- restaurant-menu
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_menu_items (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  modifiers_json TEXT,
  image_document_id TEXT,
  available INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON restaurant_menu_items(tenant_id);

-- ============================================================
-- restaurant-order-management
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  fulfillment_type TEXT NOT NULL,
  table_id TEXT,
  delivery_address TEXT,
  special_instructions TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON restaurant_orders(tenant_id);

-- ============================================================
-- restaurant-table-management
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  label TEXT NOT NULL,
  seats INTEGER NOT NULL,
  status TEXT NOT NULL,
  current_order_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tables_tenant ON restaurant_tables(tenant_id);

-- ============================================================
-- restaurant-kitchen-display
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_kitchen_tickets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  station TEXT NOT NULL,
  priority INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kitchen_tickets_tenant ON restaurant_kitchen_tickets(tenant_id);

-- ============================================================
-- restaurant-reservations
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_reservations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  party_size INTEGER NOT NULL,
  scheduled_at TEXT NOT NULL,
  table_id TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reservations_tenant ON restaurant_reservations(tenant_id);

-- ============================================================
-- restaurant-delivery-management
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_deliveries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT NOT NULL,
  address TEXT NOT NULL,
  driver_id TEXT,
  status TEXT NOT NULL,
  picked_up_at TEXT,
  delivered_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_deliveries_tenant ON restaurant_deliveries(tenant_id);

-- ============================================================
-- restaurant-ingredient-tracking (2 entities: Ingredient, Recipe)
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_ingredients (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  low_threshold INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ingredients_tenant ON restaurant_ingredients(tenant_id);

CREATE TABLE IF NOT EXISTS restaurant_recipes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  menu_item_ingredient_key TEXT NOT NULL,
  ingredients_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant ON restaurant_recipes(tenant_id);

-- ============================================================
-- restaurant-billing
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_bills (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_ids_json TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  service_charge_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  tip_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bills_tenant ON restaurant_bills(tenant_id);

-- ============================================================
-- restaurant-shift-management
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_shifts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  staff_user_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  handoff_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shifts_tenant ON restaurant_shifts(tenant_id);

-- ============================================================
-- restaurant-promotions
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_coupons (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  max_redemptions INTEGER NOT NULL,
  redemption_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_coupons_tenant ON restaurant_coupons(tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_tenant_code ON restaurant_coupons(tenant_id, code);
