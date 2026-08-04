# Retail Product Catalog

> Manage products, categories, pricing, photos, descriptions, and availability.

**Component ID:** `retail-product-catalog`
**Industry:** Retail shops
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Provide the central source of truth for what a retail shop sells — products, their categories, their prices, and whether they are currently available for sale.

## Business problem solved

Haitian shops today track products in notebooks or in a WhatsApp group, with no central record of price changes, discontinued items, or category structure. This component gives every shop a single API to manage its catalog, which other components (POS, inventory, reports) consume.

## Supported industries

Retail shops.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create, update, archive products
- Organize products into categories (one product, one category)
- Track price history (each change is recorded)
- Mark products as active or archived
- Store product photos (via document-management)
- Per-tenant isolation

## Dependencies

- `@business-os/shared`

## Configuration options

- `maxProductsPerTenant` (`number`, default `50000`) — Hard cap on products per tenant.
- `maxCategoriesPerTenant` (`number`, default `200`) — Hard cap on categories per tenant.
- `defaultCurrency` (`string`, default `"HTG"`) — Default currency for new product prices.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `retail.products.create`
- `retail.products.update`
- `retail.products.archive`
- `retail.products.read`
- `retail.categories.manage`

## Data handled

Product name, description, price, category, photo references, SKU/barcode. Product data is generally not sensitive but is commercially valuable.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No variant support (size/color) — a future version will add variants.
- No multi-currency pricing — each product has one price in one currency.
- No bulk import — products are created one at a time.

## Future improvements

- Product variants (size, color, etc.).
- Bulk import via CSV.
- Price history query API.

---

## Folder layout

```
retail-product-catalog/
├── README.md                  (this file)
├── component.json             (machine-readable manifest)
├── documentation/
│   ├── contract.md            (API contract)
│   └── configuration.md       (config reference)
├── backend/
│   ├── types.ts               (domain types — the canonical contract)
│   ├── validation.ts          (input validation helpers)
│   ├── logic.ts               (operations + permission/audit enforcement)
│   └── index.ts               (public barrel)
├── database/
│   └── schema.ts              (data model — types only, no DB adapter yet)
├── api/
│   └── contract.ts            (HTTP-shaped contract — types only)
├── config/
│   ├── schema.ts              (config schema)
│   └── defaults.ts            (default values)
├── tests/
│   ├── logic.test.ts          (happy path + business rules)
│   ├── validation.test.ts     (input validation)
│   └── tenant-isolation.test.ts (cross-tenant access denial)
└── examples/
    └── basic-usage.ts
```
