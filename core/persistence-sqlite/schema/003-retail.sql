-- Schema for retail-shops components (Layer 2), SQLite dialect.
-- All tables are tenant-scoped: every table has a tenant_id column
-- and an index on (tenant_id). The application layer enforces
-- scoping; the DB indexes support it.
--
-- Run on startup by the persistence adapter.
-- All statements use CREATE TABLE IF NOT EXISTS so re-running is safe.

-- ============================================================
-- retail-barcode-scanning
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_barcodes (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  code TEXT NOT NULL,
  format TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_barcodes_tenant ON retail_barcodes(tenant_id);

-- ============================================================
-- retail-customer-management
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_customers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  loyalty_notes TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_customers_tenant ON retail_customers(tenant_id);

-- ============================================================
-- retail-inventory
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_stock_levels (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  low_stock_threshold INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_stock_levels_tenant ON retail_stock_levels(tenant_id);

CREATE TABLE IF NOT EXISTS retail_stock_movements (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_stock_movements_tenant ON retail_stock_movements(tenant_id);

-- ============================================================
-- retail-point-of-sale
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_sales (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  cart_json TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  payment_id TEXT,
  receipt_document_id TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_sales_tenant ON retail_sales(tenant_id);

-- ============================================================
-- retail-product-catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_categories (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_categories_tenant ON retail_categories(tenant_id);

CREATE TABLE IF NOT EXISTS retail_products (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  category_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  photo_document_id TEXT,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_products_tenant ON retail_products(tenant_id);

-- ============================================================
-- retail-promotions
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_promotions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value INTEGER NOT NULL,
  scope_json TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_promotions_tenant ON retail_promotions(tenant_id);

-- ============================================================
-- retail-sales-reports
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_sale_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL,
  tax_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_sale_records_tenant ON retail_sale_records(tenant_id);

CREATE TABLE IF NOT EXISTS retail_daily_sales_summaries (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  date TEXT NOT NULL,
  total_sales_count INTEGER NOT NULL,
  total_revenue_cents INTEGER NOT NULL,
  total_discount_cents INTEGER NOT NULL,
  total_tax_cents INTEGER NOT NULL,
  average_basket_cents INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_daily_sales_summaries_tenant ON retail_daily_sales_summaries(tenant_id);

-- ============================================================
-- retail-stock-alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_stock_alerts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  current_quantity INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  notification_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_stock_alerts_tenant ON retail_stock_alerts(tenant_id);

-- ============================================================
-- retail-supplier-management
-- ============================================================
CREATE TABLE IF NOT EXISTS retail_suppliers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  payment_terms_days INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_suppliers_tenant ON retail_suppliers(tenant_id);

CREATE TABLE IF NOT EXISTS retail_purchase_orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  supplier_id TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  received_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_retail_purchase_orders_tenant ON retail_purchase_orders(tenant_id);
