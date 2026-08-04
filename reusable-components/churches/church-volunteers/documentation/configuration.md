# Configuration Reference — `church-volunteers`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxAssignmentsPerVolunteer` | `number` | `5` | Max simultaneous active assignments per volunteer. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/churches/church-volunteers/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxAssignmentsPerVolunteer: /* your value */,  // override only what changes
};
```
