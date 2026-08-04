# Configuration Reference — `service-job-tracking`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxTasksPerJob` | `number` | `50` | Cap on tasks per job. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/service-businesses/service-job-tracking/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxTasksPerJob: /* your value */,  // override only what changes
};
```
