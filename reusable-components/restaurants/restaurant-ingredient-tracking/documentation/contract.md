# API Contract — `restaurant-ingredient-tracking`

> The TypeScript types in `backend/types.ts` and `backend/validation.ts` are the canonical contract. This document is a human-readable summary; if it disagrees with the types, the types win.

## Operations

### `addIngredientStock`

**Permission required:** `restaurant.ingredients.manage`

**Description:** Add quantity to an ingredient (restock).

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `ingredientId` | `string` | yes |  |
| `quantityAdded` | `number` | yes |  |

**Returns:** `Result<Ingredient>`

**Audit:** emits an entry with action `restaurant.ingredient.restocked`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.

### `depleteForMenuItem`

**Permission required:** `restaurant.ingredients.manage`

**Description:** Deplete ingredient quantities based on a recipe, when a menu item is sold. Quantities are in the smallest unit.

**Input:**

| Field | Type | Required | Description |
|---|---|---|---|
| `menuItemIngredientKey` | `string` | yes |  |
| `quantitySold` | `number` | yes |  |

**Returns:** `Result<ReadonlyArray<Ingredient>>`

**Audit:** emits an entry with action `restaurant.ingredient.depleted`.

**Errors:**

- `PERMISSION_DENIED` — caller lacks the required permission.
- `TENANT_ISOLATION_VIOLATION` — caller attempted cross-tenant access.
- `INVALID_INPUT` — input failed validation.
- `NOT_FOUND` — referenced entity does not exist (where applicable).
- `BUSINESS_RULE_VIOLATION` — input violated a business rule.
