# Configuration Reference — `clinic-medical-records`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxNotesLengthChars` | `number` | `20000` | Max characters per consultation note. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/clinics/clinic-medical-records/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxNotesLengthChars: /* your value */,  // override only what changes
};
```
