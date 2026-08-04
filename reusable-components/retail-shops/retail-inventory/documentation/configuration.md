# Configuration Reference — `retail-inventory`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultLowStockThreshold` | `number` | `5` | Default threshold below which a low-stock alert fires. |
| `allowNegativeStock` | `boolean` | `false` | Whether stock can go below zero (forbidden by default). |
| `maxMovementsPerProduct` | `number` | `10000` | Cap on movement history per product. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-inventory/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultLowStockThreshold: /* your value */,  // override only what changes
};
```
