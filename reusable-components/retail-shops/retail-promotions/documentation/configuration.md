# Configuration Reference — `retail-promotions`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxActivePromotionsPerTenant` | `number` | `20` | Cap on simultaneously active promotions. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-promotions/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxActivePromotionsPerTenant: /* your value */,  // override only what changes
};
```
