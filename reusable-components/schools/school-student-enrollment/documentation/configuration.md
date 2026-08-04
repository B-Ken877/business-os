# Configuration Reference — `school-student-enrollment`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `maxStudentsPerTenant` | `number` | `10000` | Cap on student records. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-student-enrollment/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  maxStudentsPerTenant: /* your value */,  // override only what changes
};
```
