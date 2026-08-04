# Restaurant Menu

> Menus, categories, items, modifiers, pricing, availability, and images.

**Component ID:** `restaurant-menu`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Manage what a restaurant offers: menu items, their categories, their modifiers (size, add-ons), pricing, and current availability (86 an item when out of ingredients).

## Business problem solved

Restaurant menus change often — daily specials, 86'd items, price updates. Paper menus can't keep up. This component gives every restaurant a single API to manage its menu, which the POS and kitchen display consume.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Create menu items with name, description, price, and category
- Define modifiers (size, add-ons, spice level)
- Mark items as available or 86'd (temporarily unavailable)
- Organize items into categories (starters, mains, desserts)
- Attach images via document-management

## Dependencies

- `@business-os/shared`

## Configuration options

- `defaultCurrency` (`string`, default `"HTG"`) — Default currency for new menu items.
- `maxItemsPerTenant` (`number`, default `1000`) — Cap on menu items.
- `maxModifiersPerItem` (`number`, default `20`) — Cap on modifiers per item.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.menu.items.manage`
- `restaurant.menu.items.read`
- `restaurant.menu.availability.manage`
- `restaurant.menu.categories.manage`

## Data handled

Menu item names, descriptions, prices, modifier definitions. Generally not sensitive but commercially valuable.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No modifier enforcement at order time yet.
- No multi-language menu support.

## Future improvements

- Modifier enforcement at order time.
- Multi-language menu.
- Scheduled menu (lunch vs dinner).

---

## Folder layout

```
restaurant-menu/
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
