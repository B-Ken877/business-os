# Configuration Reference — `restaurant-menu`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultCurrency` | `string` | `"HTG"` | Default currency for new menu items. |
| `maxItemsPerTenant` | `number` | `1000` | Cap on menu items. |
| `maxModifiersPerItem` | `number` | `20` | Cap on modifiers per item. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-menu/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultCurrency: /* your value */,  // override only what changes
};
```
