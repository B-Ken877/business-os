# Configuration Reference — `clinic-staff-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxStaffPerTenant` | `number` | `500` | Cap on staff records. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-staff-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxStaffPerTenant: /* your value */,  // override only what changes
};
```
