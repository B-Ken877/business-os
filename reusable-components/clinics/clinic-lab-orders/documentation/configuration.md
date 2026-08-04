# Configuration Reference — `clinic-lab-orders`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultResultTurnaroundHours` | `number` | `24` | Default expected turnaround. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-lab-orders/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultResultTurnaroundHours: /* your value */,  // override only what changes
};
```
