# Configuration Reference — `church-donations`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultCurrency` | `string` | `"HTG"` | Default currency. |
| `requireFundDesignation` | `boolean` | `true` | Whether every donation must designate a fund (tithe, offering, building, etc.). |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-donations/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultCurrency: /* your value */,  // override only what changes
};
```
