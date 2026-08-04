# Configuration Reference — `school-grading`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `passingGradePct` | `number` | `60` | Passing grade percentage. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-grading/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  passingGradePct: /* your value */,  // override only what changes
};
```
