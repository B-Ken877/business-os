# Configuration Reference — `school-teacher-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxWorkloadHoursPerWeek` | `number` | `30` | Maximum teaching hours per week. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-teacher-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxWorkloadHoursPerWeek: /* your value */,  // override only what changes
};
```
