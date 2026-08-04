# Configuration Reference — `payments-or-collections`

Configuration is preferred over customization (see `architecture-rules.md` §4). Each tenant overrides only the keys it needs; the rest fall back to defaults in `config/defaults.ts`.

| Key | Type | Default | Description |
|---|---|---|---|
| `defaultCurrency` | `string` | `"HTG"` | Default currency code (ISO 4217). |
| `supportedMethods` | `ReadonlyArray<string>` | `["cash","card","mobile_money","bank_transfer"]` | Payment methods accepted. |
| `requireReferenceForNonCash` | `boolean` | `true` | Whether non-cash payments must include a provider transaction reference. |

## Overriding per tenant

```ts
import { defaultConfig } from "@business-os/reusable-components/cross-cutting/payments-or-collections/config/defaults";

const tenantConfig = {
  ...defaultConfig,
  defaultCurrency: /* your value */,  // override only what changes
};
```
