# Restaurant Ingredient Tracking

> Ingredient stock, depletion tracking, and recipe-linked inventory reduction.

**Component ID:** `restaurant-ingredient-tracking`
**Industry:** Restaurants
**Stability:** experimental — structure & contract are stable; first safe increment of functionality is implemented.

---

## Purpose

Track raw ingredient quantities and automatically deplete them when a menu item is sold (via its recipe).

## Business problem solved

Restaurants run out of ingredients mid-service because they track finished dishes, not raw stock. This component links recipes to inventory.

## Supported industries

Restaurants.

This component is **reusable** across all businesses in its industry. Variation between businesses is expressed through configuration, not through forks of the source. See `ai-instructions/architecture-rules.md` §4 (Configuration Over Customization).

## Features

- Track ingredient quantities
- Define recipes (menu item → ingredient quantities)
- Auto-deplete on order completion
- Low-ingredient alerts via notifications-center

## Dependencies

- `@business-os/shared`
- `restaurant-menu`

## Configuration options

- `defaultLowIngredientThreshold` (`number`, default `2`) — Default low-ingredient threshold.

See `config/defaults.ts` for the runtime defaults and `config/schema.ts` for the schema.

## Permissions required

The component expects the following permissions to exist in the tenant's authorization model. Each permission is checked at the boundary of the corresponding operation — see `backend/logic.ts`.

- `restaurant.ingredients.manage`
- `restaurant.ingredients.read`
- `restaurant.recipes.manage`

## Data handled

Ingredient names, quantities, recipes. Not sensitive.

The component owns its data. Other components interact with it **only** through the public API exported from `backend/index.ts`. Direct table access is forbidden — it bypasses tenant isolation and audit logging.

## API interfaces

The public API surface is exported from `backend/index.ts`. The full request/response contract is documented in `documentation/contract.md`. The TypeScript types in `backend/types.ts` are the canonical contract — if the docs and the types disagree, the types win.

## Limitations

- No expiry tracking.
- No supplier link — restocks are recorded but not tied to a PO.

## Future improvements

- Expiry tracking.
- Supplier link via retail-supplier-management (shared).
- Auto-reorder.

---

## Folder layout

```
restaurant-ingredient-tracking/
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
