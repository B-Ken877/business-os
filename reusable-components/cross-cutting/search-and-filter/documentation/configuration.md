# Configuration Reference — `search-and-filter`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultPageSize` | `number` | `20` | Default items per page. |
| `maxPageSize` | `number` | `100` | Maximum items per page a caller can request. |
| `maxFilterClauses` | `number` | `10` | Maximum number of filter clauses per query. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/search-and-filter/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultPageSize: /* your value */,  // override only what changes
};
```
