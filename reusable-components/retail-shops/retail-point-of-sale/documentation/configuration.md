# Configuration Reference — `retail-point-of-sale`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultTaxRateBps` | `number` | `1000` | Default tax rate in basis points (1000 = 10%). |
| `currency` | `string` | `"HTG"` | POS currency. |
| `allowNegativeCartTotal` | `boolean` | `false` | Whether a cart can have a negative total after discounts (forbidden by default). |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-point-of-sale/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultTaxRateBps: /* your value */,  // override only what changes
};
```
