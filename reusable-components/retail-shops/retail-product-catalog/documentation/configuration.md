# Configuration Reference — `retail-product-catalog`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxProductsPerTenant` | `number` | `50000` | Hard cap on products per tenant. |
| `maxCategoriesPerTenant` | `number` | `200` | Hard cap on categories per tenant. |
| `defaultCurrency` | `string` | `"HTG"` | Default currency for new product prices. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-product-catalog/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxProductsPerTenant: /* your value */,  // override only what changes
};
```
