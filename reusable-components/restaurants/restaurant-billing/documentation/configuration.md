# Configuration Reference — `restaurant-billing`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultServiceChargeBps` | `number` | `0` | Default service charge in basis points (0 = none). |
| `defaultTaxBps` | `number` | `1000` | Default tax rate in basis points (10%). |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-billing/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultServiceChargeBps: /* your value */,  // override only what changes
};
```
