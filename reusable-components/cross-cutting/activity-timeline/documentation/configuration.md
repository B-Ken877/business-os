# Configuration Reference — `activity-timeline`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxEventsPerEntity` | `number` | `10000` | Cap on events stored per entity; older events are archived. |
| `summaryMaxLength` | `number` | `500` | Maximum characters for an event's summary field. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/activity-timeline/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxEventsPerEntity: /* your value */,  // override only what changes
};
```
