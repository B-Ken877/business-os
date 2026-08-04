# Configuration Reference — `school-student-portal`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `allowStudentMessageReply` | `boolean` | `false` | Whether students can reply to parent messages. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/schools/school-student-portal/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  allowStudentMessageReply: /* your value */,  // override only what changes
};
```
