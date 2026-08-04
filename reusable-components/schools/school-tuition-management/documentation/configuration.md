# Configuration Reference — `school-tuition-management`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultPlanInstallments` | `number` | `10` | Default number of installments. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-tuition-management/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultPlanInstallments: /* your value */,  // override only what changes
};
```
