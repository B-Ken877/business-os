# Configuration Reference — `service-catalog`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultCurrency` | `string` | `"HTG"` | Default currency. |
| `maxServicesPerTenant` | `number` | `1000` | Cap on services. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-catalog/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultCurrency: /* your value */,  // override only what changes
};
```
