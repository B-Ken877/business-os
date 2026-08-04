# Configuration Reference — `retail-sales-reports`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `topN` | `number` | `10` | Default N for top-products reports. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/retail-shops/retail-sales-reports/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  topN: /* your value */,  // override only what changes
};
```
