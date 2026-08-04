# Configuration Reference — `restaurant-table-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxTablesPerTenant` | `number` | `100` | Cap on tables. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/restaurants/restaurant-table-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxTablesPerTenant: /* your value */,  // override only what changes
};
```
