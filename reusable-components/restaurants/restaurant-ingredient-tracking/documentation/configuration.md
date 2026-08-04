# Configuration Reference — `restaurant-ingredient-tracking`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultLowIngredientThreshold` | `number` | `2` | Default low-ingredient threshold. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-ingredient-tracking/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultLowIngredientThreshold: /* your value */,  // override only what changes
};
```
