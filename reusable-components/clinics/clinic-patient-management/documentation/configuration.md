# Configuration Reference — `clinic-patient-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `requireDateOfBirth` | `boolean` | `true` | Whether date of birth is required. |
| `maxPatientsPerTenant` | `number` | `100000` | Cap on patient records. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-patient-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  requireDateOfBirth: /* your value */,  // override only what changes
};
```
