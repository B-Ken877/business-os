# Configuration Reference — `school-attendance`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `chronicAbsenceThresholdPct` | `number` | `20` | Absent percentage above which a student is flagged chronic. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-attendance/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  chronicAbsenceThresholdPct: /* your value */,  // override only what changes
};
```
