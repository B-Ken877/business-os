# Business OS

> Digital infrastructure for Haitian businesses — a backend factory with ready components, not a template store.

---

## The Car Factory Analogy (read this first)

Business OS is a **car factory**, not a car dealership.

When a customer orders a car from a factory, they don't pick from a catalog of pre-built cars. They describe what they want — an SUV, a sports car, a pickup truck. The factory has every component ready: the engine, the wheels, the flywheel, the door system, the suspension, the security system. But the factory does **not** have a pre-built SUV sitting on a shelf waiting for a new paint job. The factory builds the SUV from scratch — designs the body, shapes the chassis, polishes the finish — using the same engine and wheels that every other car uses.

Business OS works the same way:

| Factory | Business OS |
|---|---|
| Engine | `core/` (identity, auth, organizations, authorization, audit, HTTP server, SQLite persistence) |
| Wheels, doors, suspension, flywheel | `reusable-components/` (65 industry-specific modules across 7 verticals) |
| The custom car body, designed from scratch per customer | The website's UI, designed from scratch per client |
| The customer says "I want an SUV" | The client says "I want a restaurant website with online ordering and a loyalty program" |
| The factory assembles the SUV using the same engine | The AI assembles the website using the same backend |
| The SUV is polished and shaped specifically for this customer | The UI is designed and styled specifically for this client |

**The backend components are ready. The UI is never pre-made. Every website is designed from scratch.**

This is the single most important rule of the platform. If you are an AI agent building a website for a client, you do not start from a template. You do not pick a pre-built UI. You design the UI from scratch based on what the client tells you they need, and you wire it to the ready-made backend components.

---

## What is ready (the factory inventory)

### Layer 1 — Core (`core/`)

The engine. Every business needs this, regardless of industry.

| Module | What it does | Status |
|---|---|---|
| `platform/` | Universal primitives — `TenantContext`, `Result`, `PermissionChecker`, `AuditSink`, `EntityId`, `ErrorCode` | ✅ Stable |
| `identity/` | Users, scrypt password hashing, sessions, login/register/logout, password change, session revocation | ✅ Stable |
| `organizations/` | Tenants, membership, invitations, tenant resolution by slug | ✅ Stable |
| `authorization/` | RBAC with system roles (owner/administrator/member/viewer), custom roles, wildcard permissions (`*.*`, `retail.*`) | ✅ Stable |
| `audit-log/` | Append-only audit trail, queryable with filters + pagination, 7-year retention | ✅ Stable |
| `http/` | Hono HTTP server with auth + tenant + permission middleware, 166 routes wired (16 core + 150 component) | ✅ Stable |
| `persistence-sqlite/` | SQLite adapter for all core stores — zero-config, file-based, WAL mode | ✅ Stable |

### Layer 2 — Reusable Components (`reusable-components/`)

The wheels, doors, suspension. Industry-specific modules, ready to power any website in that industry.

**65 components across 7 verticals:**

| Vertical | Folder | Components | What they cover |
|---|---|---|---|
| Retail shops | `retail-shops/` | 9 | Products, inventory, POS, suppliers, stock alerts, customers, barcodes, sales reports, promotions |
| Restaurants | `restaurants/` | 10 | Menu, orders, tables, kitchen display, reservations, delivery, ingredients, billing, shifts, promotions |
| Schools | `schools/` | 10 | Enrollment, attendance, tuition, grading, scheduling, parent comms, exams, certificates, teachers, student portal |
| Churches | `churches/` | 8 | Members, donations, events, groups, attendance, announcements, volunteers, sermons |
| Clinics | `clinics/` | 10 | Patients, appointments, medical records, prescriptions, triage, billing, lab orders, consent, reminders, staff |
| Service businesses | `service-businesses/` | 8 | Service catalog, quotes, booking, job tracking, invoicing, customers, feedback, scheduling |
| Cross-cutting | `cross-cutting/` | 10 | Messaging, documents, reports, notes, activity timeline, search, notifications, forms, payments, roles UI |

Every component:
- Has a stable ID, README, types, validation, logic, tests, and examples
- Enforces permission checks, tenant isolation, and audit logging on every operation
- Is callable via HTTP at `/v1/{component-id}/{operation-name}`
- Returns `Result<T>` (success) or structured errors (never throws on business logic)

### What is NOT ready (by design)

- **No pre-built UI.** There are zero React components, zero page templates, zero design systems. Every website's UI is built from scratch per client.
- **No templates (Layer 3).** There is no `templates/restaurants/` kit that pre-assembles restaurant components with a default UI. Templates in this platform are recipes for which backend components to include, not pre-built UIs.
- **No business projects (Layer 4).** No specific client has been onboarded yet.

**This is intentional.** Pre-built UI would defeat the purpose — every client gets a website designed specifically for them.

---

## How to build a website for a client (the AI playbook)

If you are an AI agent and a human says "build a website for [client]," follow this exact sequence. The full playbook is in `ai-instructions/building-for-a-client.md`.

### Step 1 — Listen to the client

Ask what the client does, who their customers are, what they want the website to achieve. Do not assume — ask. A restaurant with online ordering is a different website from a restaurant with only a menu display, even though they use the same backend components.

### Step 2 — Select backend components from the inventory

Based on what the client needs, select which `reusable-components/` modules to use. For a restaurant with online ordering:
- `restaurant-menu` (the menu)
- `restaurant-order-management` (the orders)
- `restaurant-billing` (the bills)
- `messaging-center` (order confirmations)
- `payments-or-collections` (payment recording)
- `notifications-center` (in-app notifications)

You do not write any backend code. You select from what exists.

### Step 3 — Design the UI from scratch

Design the website's UI based on the client's brand, their customers, and their specific needs. Do not copy a template. Do not reuse a previous client's design. Build it fresh:
- Choose colors, typography, layout — based on the client's identity
- Choose which screens to build — based on what the client's customers need to do
- Choose the user flow — based on how this specific business operates
- Write the React (or whatever frontend framework) components from scratch

### Step 4 — Wire the UI to the backend

Every UI action calls an HTTP endpoint that already exists. You do not write backend logic. You call:
- `POST /v1/identity/register` when a user signs up
- `POST /v1/identity/login` when a user logs in
- `POST /v1/organizations` when the business onboards
- `PATCH /v1/retail-inventory/adjust-stock` when stock changes
- etc.

The full API is documented in each component's `api/contract.ts` and `documentation/contract.md`.

### Step 5 — Deploy

The backend runs with `npm start` (SQLite, zero external setup). The frontend is a static build served separately. Point the frontend at the backend's URL.

### What you must NEVER do

- **Never copy a previous client's UI.** Every client gets a from-scratch design.
- **Never write backend business logic.** If the backend doesn't support something, extend a reusable component — don't write one-off backend code in the client project.
- **Never skip the listening step.** Building the wrong website fast is worse than building the right website slowly.
- **Never assume the industry.** A "restaurant" might be a food truck, a fine dining establishment, or a bakery — each needs a different UI despite using the same backend components.

---

## Repository Structure

```
business-os/
├── README.md                          # This file — the factory philosophy
├── server.ts                          # HTTP server entry point (npm start)
├── package.json                       # TypeScript + Hono + better-sqlite3 + Vitest
├── tsconfig.json                      # Path aliases: @business-os/{shared,core,components}
├── vitest.config.ts                   # Test config
│
├── ai-instructions/                   # The constitution — read before building anything
│   ├── architecture-rules.md          # The four-layer model
│   ├── component-standard.md          # How components are structured
│   ├── git-workflow.md                # Branch + commit + PR rules
│   ├── security-rules.md              # Auth, authz, tenant isolation, data protection
│   └── building-for-a-client.md       # THE PLAYBOOK — how to build a client website
│
├── core/                              # Layer 1 — the engine (7 modules, stable)
│   ├── platform/                      # Universal primitives
│   ├── identity/                      # Users, passwords, sessions
│   ├── organizations/                 # Tenants, membership, invitations
│   ├── authorization/                 # RBAC, roles, permissions
│   ├── audit-log/                     # Append-only audit trail
│   ├── http/                          # Hono server + 166 routes
│   ├── persistence-sqlite/            # SQLite adapter (zero-config)
│   └── README.md                      # Module catalog + usage
│
├── reusable-components/               # Layer 2 — the wheels/doors/suspension (65 components)
│   ├── retail-shops/                  # 9 components
│   ├── restaurants/                   # 10 components
│   ├── schools/                       # 10 components
│   ├── churches/                      # 8 components
│   ├── clinics/                       # 10 components
│   ├── service-businesses/            # 8 components
│   ├── cross-cutting/                 # 10 components
│   ├── _shared/                       # Deprecated shim (moved to core/platform/)
│   ├── README.md                      # Component catalog
│   └── library-manifest.json          # Machine-readable index
│
├── templates/                         # Layer 3 — NOT YET BUILT (recipes, not pre-built UIs)
├── business-projects/                 # Layer 4 — NOT YET BUILT (per-client implementations)
│
└── documentation/                     # Platform-wide docs
```

---

## Current Status

| Layer | Status | Tests |
|---|---|---|
| 1. Core | ✅ Built — 7 modules, all stable | 95 core tests |
| 2. Reusable Components | ✅ Built — 65 components, all stable | 1,044 component tests |
| 3. Templates | ❌ Not built — by design, will be backend recipes only | — |
| 4. Business Projects | ❌ Not built — built per client | — |
| HTTP server | ✅ Built — 166 routes wired | 28 integration tests |
| **Total** | | **1,151 tests, 0 typecheck errors** |

Run the backend:
```bash
npm install
npm start    # → http://localhost:3000
```

Run the tests:
```bash
npm test     # → 1,151 tests passing
```

---

## License

To be defined.
