# Configuration Reference — `reporting-dashboard`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxMetricsPerTenant` | `number` | `50` | Hard cap on the number of metrics a tenant can define. |
| `defaultRefreshIntervalSeconds` | `number` | `300` | Default refresh interval (5 minutes). |
| `maxQueryWindowDays` | `number` | `365` | Maximum days a single query can span. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/reporting-dashboard/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxMetricsPerTenant: /* your value */,  // override only what changes
};
```
