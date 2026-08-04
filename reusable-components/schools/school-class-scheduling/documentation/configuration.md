# Configuration Reference — `school-class-scheduling`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `sessionDurationMinutes` | `number` | `45` | Default session duration. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-class-scheduling/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  sessionDurationMinutes: /* your value */,  // override only what changes
};
```
