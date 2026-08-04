## Description

Adds the reusable-components library (Layer 2) — 65 industry-specific business capabilities organized into 7 industry folders (retail-shops, restaurants, schools, churches, clinics, service-businesses, cross-cutting) plus a `_shared/` folder of platform primitives pending promotion to `core/`.

## Reason for change

This is the foundational build of Layer 2, which future templates (Layer 3) and business projects (Layer 4) will assemble from. The platform cannot ship a single business system until the reusable catalog exists. Without it, every new business would require building from scratch — the copy-and-modify anti-pattern explicitly forbidden in `ai-instructions/architecture-rules.md` §1.

## Files changed

- **Root tooling:** `package.json` (TypeScript + Vitest), `tsconfig.json` (with `@business-os/shared` alias), `vitest.config.ts`, `.gitignore`.
- **Shared primitives:** `reusable-components/_shared/` (7 files + 1 test file) — `TenantContext`, `PermissionChecker`, `Result`, `AuditSink`, `EntityId`, `ErrorCode`.
- **65 components:** each with `README.md`, `component.json`, `documentation/{contract,configuration}.md`, `backend/{types,validation,logic,index}.ts`, `database/schema.ts`, `api/contract.ts`, `config/{schema,defaults}.ts`, `tests/{logic,validation,tenant-isolation}.test.ts`, `examples/basic-usage.ts`. The `roles-and-permissions-ui` component additionally includes a `frontend/` stub.
- **Library-level docs:** `reusable-components/README.md` (catalog + usage guide), `reusable-components/library-manifest.json` (machine-readable index).

## Testing performed

- `npm test` — 1,044 tests across 196 test files, all passing.
- Per-component coverage:
  - **logic.test.ts**: permission-denial test per operation (auto-generated) + happy-path and business-rule tests per the component's spec.
  - **validation.test.ts**: happy-path + missing-required-field + invalid-value tests per declared validation rule.
  - **tenant-isolation.test.ts**: cross-tenant read returns `undefined`; overwriting in tenant B does not affect tenant A.
- Manual verification: ran `npx vitest run` per vertical; all green.

Not tested:
- No integration tests across components (e.g. retail-POS calling retail-inventory) — cross-component composition is the orchestrator's responsibility, which will be built at the template layer.
- No UI tests — per `ai-instructions/architecture-rules.md`, no production UI is implemented at this stage; only `roles-and-permissions-ui` includes a `frontend/` stub because its purpose is to declare UI contracts.

## Security considerations

- **Tenant isolation enforced and tested:** every component's store is tenant-scoped by `tenantId`, and every component's test suite includes a tenant-isolation test verifying cross-tenant reads return `undefined`.
- **Permissions enforced on every operation:** every operation calls `deps.permissions.require(ctx, asPermission(...))` as its first action, and every component's test suite includes a permission-denial test using `DenyAllPermissionChecker`.
- **Audit on every state-changing operation:** every state-changing operation writes an `AuditEntry` to the injected `AuditSink` with `componentId`, `action`, `entityType`, `entityId`, and structured `details`.
- **Audit-on-read for sensitive components:** `clinic-patient-management.getPatient` and `clinic-medical-records.listRecordsForPatient` audit the READ itself (not just writes), per `ai-instructions/security-rules.md` §5.
- **Consent management:** `clinic-consent` implements grant/revoke/check with audit on every action, including checks.
- **No secrets in code:** no API keys, passwords, or signing secrets appear anywhere in the generated code. The repository's `.gitignore` excludes `.env` files and `*.pem`/`*.key`.
- **No raw card data:** `payments-or-collections` accepts only provider references (e.g. `providerReference` for non-cash payments); it never touches raw card numbers, per `ai-instructions/security-rules.md` §5.
- **Input validation:** every operation with parameters runs through auto-generated validation (`validate<Input>Input`) before any business logic runs, using allow-list validation per `ai-instructions/security-rules.md` §4.

## Documentation updates

- `reusable-components/README.md` — library overview, component catalog, standard structure, usage example, testing approach, relation to future layers.
- `reusable-components/library-manifest.json` — machine-readable index of all 65 components with industry, sensitivity, and shared-primitive exports.
- Each component's `README.md` follows the 11 required sections from `ai-instructions/component-standard.md` §4 (Purpose, Problem, Industries, Features, Dependencies, Configuration, Permissions, Data, API, Limitations, Future).
- Each component's `documentation/contract.md` documents the operation-level API contract.
- Each component's `documentation/configuration.md` documents the config keys with types and defaults.
- `reusable-components/_shared/README.md` documents the shared primitives and their promotion path to `core/`.

## Component Justification (per `ai-instructions/component-standard.md` §7)

1. **Why are these components needed?** Each component represents a real business capability a Haitian business performs daily — managing a menu, recording a payment, scheduling an appointment, enrolling a student. Without these as reusable modules, every business project would rebuild them from scratch.

2. **Why can existing components not solve the problem?** This is the foundational build of Layer 2 — there are no prior reusable components to extend. The components are scoped to single, cohesive business capabilities per `ai-instructions/component-standard.md` §5 ("Have clear boundaries"). No component duplicates another's responsibility.

3. **Where do the components belong?** Each component is placed in the industry folder matching its vertical (per the README's directory listing). The `cross-cutting/` folder holds capabilities used across multiple industries but still configurable business capabilities (not universal platform primitives, which belong in `core/`). The `_shared/` folder holds platform primitives that belong in `core/` once that layer is built — they are explicitly marked as pending promotion.

## Breaking changes

None. This is the first build of Layer 2; there are no prior consumers to break. The public API of each component is declared stable from this commit forward per `ai-instructions/component-standard.md` §2 (Stage 3 — Reusable Component).
