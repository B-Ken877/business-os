# Configuration Reference — `service-invoicing`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultCurrency` | `string` | `"HTG"` | Default currency. |
| `defaultTaxBps` | `number` | `1000` | Default tax rate. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-invoicing/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultCurrency: /* your value */,  // override only what changes
};
```
