# Configuration Reference — `restaurant-promotions`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxActiveCoupons` | `number` | `50` | Cap on active coupons. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-promotions/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxActiveCoupons: /* your value */,  // override only what changes
};
```
