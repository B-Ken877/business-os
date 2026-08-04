# Reusable Components

> Industry-specific business capabilities for Business OS. Each component is a complete, self-contained capability — data, logic, API contract, permissions, tests, and documentation — designed to be reused across many businesses in the same industry.

**Status:** experimental — the structure, contracts, and tests are stable; the first safe increment of functionality is implemented for every component.

**Test status:** 1,044 tests passing across 196 test files. Run `npm test` from the repository root.

---

## What this layer is

`reusable-components/` is Layer 2 of the four-layer Business OS architecture (see `ai-instructions/architecture-rules.md` §2). Where Layer 1 (`core/`) holds capabilities every business needs regardless of industry, this layer holds capabilities specific to an industry — a restaurant's menu, a clinic's patient records, a school's tuition plans.

A component here is **not** a UI fragment. It is a complete business capability: the data it owns, the logic it enforces, the API it exposes, the permissions it requires, and the tests that verify it behaves as documented. Reducing a component to just its UI is one of the most damaging mistakes documented in `ai-instructions/component-standard.md` §1.

---

## Component count

| Industry | Folder | Components |
|---|---|---|
| Retail shops | `retail-shops/` | 9 |
| Restaurants | `restaurants/` | 10 |
| Schools | `schools/` | 10 |
| Churches | `churches/` | 8 |
| Clinics | `clinics/` | 10 |
| Service businesses | `service-businesses/` | 8 |
| Cross-cutting | `cross-cutting/` | 10 |
| **Shared primitives** | `_shared/` | (platform primitives, pending promotion to `core/`) |
| **Total components** | | **65** |

---

## Component catalog

### Retail shops (`retail-shops/`)

| ID | Purpose |
|---|---|
| `retail-product-catalog` | Products, categories, pricing, photos, availability |
| `retail-inventory` | Stock levels, movements, low-stock thresholds |
| `retail-point-of-sale` | Checkout, cart, totals, payment recording |
| `retail-supplier-management` | Suppliers, purchase orders, receipt tracking |
| `retail-stock-alerts` | Low-stock and out-of-stock alert emission |
| `retail-customer-management` | Customer records, loyalty notes, status |
| `retail-barcode-scanning` | Barcode registration and lookup |
| `retail-sales-reports` | Daily sales summaries, top products, exports |
| `retail-promotions` | Discounts, bundles, time-bounded campaigns |

### Restaurants (`restaurants/`)

| ID | Purpose |
|---|---|
| `restaurant-menu` | Menu items, categories, modifiers, availability |
| `restaurant-order-management` | Order capture, status, fulfillment |
| `restaurant-table-management` | Tables, seating, occupancy |
| `restaurant-kitchen-display` | Kitchen tickets, prep status, station routing |
| `restaurant-reservations` | Booking, table assignment, reminders |
| `restaurant-delivery-management` | Delivery orders, driver assignment, status |
| `restaurant-ingredient-tracking` | Ingredient stock, recipe-linked depletion |
| `restaurant-billing` | Bills, service charges, payment status |
| `restaurant-shift-management` | Staff shifts, handoff notes |
| `restaurant-promotions` | Coupons, happy hour, combo offers |

### Schools (`schools/`)

| ID | Purpose |
|---|---|
| `school-student-enrollment` | Student onboarding, enrollment status |
| `school-attendance` | Attendance recording, summaries, chronic absence |
| `school-tuition-management` | Tuition plans, payments, balances |
| `school-grading` | Grades, assessments, averages |
| `school-class-scheduling` | Timetable, rooms, teachers, conflict detection |
| `school-parent-communication` | Parent messages, announcements |
| `school-exams` | Exam periods, grading progress |
| `school-certificates` | Certificate issuance, revocation |
| `school-teacher-management` | Teacher profiles, subjects |
| `school-student-portal` | Student-facing portal contract |

### Churches (`churches/`)

| ID | Purpose |
|---|---|
| `church-member-management` | Member directory, family grouping, visibility |
| `church-donations` | Tithes, offerings, pledges, giving history |
| `church-events` | Service events, registrations |
| `church-groups` | Small groups, ministry teams |
| `church-attendance` | Service attendance, decline detection |
| `church-announcements` | Public and internal announcements |
| `church-volunteers` | Volunteer records, assignments |
| `church-sermons` | Sermon archive, series, media references |

### Clinics (`clinics/`)

> These components handle medical data and follow the strict privacy, permission, and audit rules in `ai-instructions/security-rules.md` §5. Every read of patient data is audited.

| ID | Purpose |
|---|---|
| `clinic-patient-management` | Patient profiles, MRN, audit-on-read |
| `clinic-appointments` | Scheduling, conflicts, reminders |
| `clinic-medical-records` | Consultation notes, audit-on-read |
| `clinic-prescriptions` | Prescriptions, refills, status |
| `clinic-triage` | Visit reason, symptoms, urgency classification |
| `clinic-billing` | Consultation fees, invoices, payments |
| `clinic-lab-orders` | Lab test orders, result tracking |
| `clinic-consent` | Consent capture, revocation, audit-on-check |
| `clinic-reminders` | Appointment, medication, follow-up reminders |
| `clinic-staff-management` | Doctors, nurses, assistants, roles |

### Service businesses (`service-businesses/`)

| ID | Purpose |
|---|---|
| `service-catalog` | Services, pricing, durations |
| `service-quotes` | Estimates, approval flow |
| `service-booking` | Appointment booking, conflict detection |
| `service-job-tracking` | Work orders, task progress |
| `service-invoicing` | Invoices, payments, balances |
| `service-customer-management` | Customer records, preferences |
| `service-feedback` | Ratings, comments, follow-up tracking |
| `service-scheduling` | Staff availability, time off |

### Cross-cutting (`cross-cutting/`)

> These belong in `reusable-components/` rather than `core/` because they are configurable business capabilities (notifications templates, payment methods, role definitions) rather than universal platform primitives (authentication, audit log). See `ai-instructions/architecture-rules.md` §2.

| ID | Purpose |
|---|---|
| `messaging-center` | Channel-agnostic message sending, delivery tracking |
| `document-management` | File uploads, attachments, metadata, quotas |
| `reporting-dashboard` | Metric definitions, computed values, dashboards |
| `notes-and-comments` | Internal notes, threaded comments |
| `activity-timeline` | Per-entity operational event history |
| `search-and-filter` | Reusable list search, filter, sort, pagination |
| `notifications-center` | In-app notification inbox per user |
| `forms-and-intake` | Configurable forms, submission handling |
| `payments-or-collections` | Payment recording, balances, refunds |
| `roles-and-permissions-ui` | Role definitions, permission catalog, UI contracts |

---

## Standard component structure

Every component follows the directory layout defined in `ai-instructions/component-standard.md` §3:

```
<component-id>/
├── README.md                  # The contract — see component-standard.md §4
├── component.json             # Machine-readable manifest
├── documentation/
│   ├── contract.md            # API contract reference
│   └── configuration.md       # Config reference
├── backend/
│   ├── types.ts               # Domain types (canonical contract)
│   ├── validation.ts          # Input validation helpers
│   ├── logic.ts               # Operations + permission/audit enforcement
│   └── index.ts               # Public barrel
├── database/
│   └── schema.ts              # Data model (types only — no DB adapter yet)
├── api/
│   └── contract.ts            # HTTP-shaped contract (types only)
├── config/
│   ├── schema.ts              # Config schema
│   └── defaults.ts            # Default values
├── tests/
│   ├── logic.test.ts          # Happy path + business rules + permission denial
│   ├── validation.test.ts     # Input validation (per field, per rule)
│   └── tenant-isolation.test.ts # Cross-tenant access denial
└── examples/
    └── basic-usage.ts
```

The `frontend/` folder is omitted by default — per `ai-instructions/architecture-rules.md`, the frontend must communicate with the backend exclusively through the documented API surface, and no production UI is implemented at this stage. The `roles-and-permissions-ui` component is the one exception: it includes a `frontend/` stub because its purpose is to declare UI contracts.

---

## How to use a component

Components are designed for dependency injection. A typical call looks like:

```ts
import { createTenantContext, InMemoryPermissionChecker, InMemoryAuditSink } from "@business-os/shared";
import { InMemoryRetailInventoryStore, adjustStock, defaultConfig } from "@business-os/reusable-components/retail-shops/retail-inventory/backend";

const ctx = createTenantContext({ tenantId: "t-1", userId: "u-1" });
const deps = {
  store: new InMemoryRetailInventoryStore(),
  permissions: new InMemoryPermissionChecker([
    { tenantId: "t-1", userId: "u-1", permissions: ["retail.inventory.adjust"] },
  ]),
  audit: new InMemoryAuditSink(),
  config: defaultConfig,
};

const result = adjustStock(ctx, deps, {
  productId: "prod-1",
  delta: 10,
  reason: "restock",
});

if (result.ok) {
  console.log("New stock level:", result.value.quantity);
}
```

In production, the in-memory implementations are replaced with platform-backed adapters:
- `InMemory*Store` → the platform's database adapter (Postgres, SQLite, etc.)
- `InMemoryPermissionChecker` → the platform's authorization service
- `InMemoryAuditSink` → the platform's audit log aggregator

The component's logic does not change — only the injected dependencies do.

---

## How components compose

Components depend on each other through their public APIs, never through direct table access. For example:

- `retail-point-of-sale` declares a dependency on `retail-product-catalog`, `retail-inventory`, and `payments-or-collections`.
- `clinic-medical-records` declares a dependency on `clinic-patient-management`.
- `restaurant-billing` declares a dependency on `restaurant-order-management` and `payments-or-collections`.

These dependencies are declared in each component's README and `component.json`. A future template (Layer 3) will compose these dependencies into a deployable system per industry — for example, a Restaurant template will bundle `restaurant-menu` + `restaurant-order-management` + `restaurant-billing` + `restaurant-kitchen-display` + the relevant `cross-cutting/` components + `core/`.

---

## Testing

Every component includes three test files at minimum:

1. **`tests/logic.test.ts`** — happy-path tests for each operation (provided via the component's spec), plus a permission-denial test for each operation (auto-generated).
2. **`tests/validation.test.ts`** — for each operation with parameters: a happy-path validation test, a missing-required-field test per parameter, and an invalid-value test per declared validation rule.
3. **`tests/tenant-isolation.test.ts`** — verifies the in-memory store returns `undefined` when reading another tenant's entity, and that overwriting an entity in tenant B does not affect tenant A.

Run all tests:

```bash
npm test
```

Run a single component's tests:

```bash
npx vitest run reusable-components/retail-shops/retail-inventory
```

---

## Relation to future layers

- **Layer 3 (Templates):** Will compose components from this layer into pre-assembled industry kits. A template does not introduce new business logic — it selects components, applies default configuration, and declares the data setup required to go live.
- **Layer 4 (Business Projects):** Will instantiate templates for specific businesses. Per `ai-instructions/architecture-rules.md` §2, business-specific code lives only at Layer 4 — never in this layer.

When a customization built for one business at Layer 4 turns out to be broadly useful, it is promoted up: from the business project, into a reusable component here, and eventually into a template (and, if universally relevant, into `core/`). This promotion flow is documented in `ai-instructions/component-standard.md` §2.

---

## Shared primitives (`_shared/`)

The `_shared/` folder holds platform primitives that every component depends on:
- `TenantContext`, `TenantId`, `UserId` (tenant.ts)
- `PermissionChecker`, `InMemoryPermissionChecker`, `PermissionDeniedError` (permissions.ts)
- `Result<T>`, `ok()`, `err()`, `ErrorCode` (result.ts, errors.ts)
- `AuditEntry`, `AuditSink`, `InMemoryAuditSink` (audit.ts)
- `EntityId`, `asEntityId`, `generateId` (ids.ts)

These are **not** business capabilities — they are platform primitives that belong in `core/` once that layer is built. They live here temporarily so components can be built and tested against a stable contract. See `_shared/README.md` for the promotion plan.

When `core/` is created, the contents of `_shared/` move into it without breaking any component imports — the `@business-os/shared` alias in `tsconfig.json` and `vitest.config.ts` is updated to point at `core/`, and no component code changes.
