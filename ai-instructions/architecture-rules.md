# Architecture Rules

> Engineering constitution of Business OS. Every contributor — human or AI — must read and internalize this document before proposing, building, or modifying any system on the platform.

**Audience:** human developers, AI coding agents, project maintainers, reviewers.
**Status:** authoritative. Conflicts between this document and any other internal guide are resolved in favor of this document.

---

## 1. Business OS Architecture Philosophy

Business OS is **not** a collection of independent websites. It is a multi-tenant business operating system in which many organizations share a single common technological foundation. A website is one surface of the platform — it is never the deliverable. The deliverable is a coherent digital system that runs a real business.

The three governing principles of this philosophy are simple and absolute:

- **Build once.** A capability is constructed a single time, in a single place, at a high standard.
- **Improve continuously.** Once built, it is iterated on, hardened, and observed in production across many tenants.
- **Reuse everywhere.** Every new business inherits the same capability instead of rebuilding it.

### Why the copy-and-modify approach is forbidden

The traditional pattern for serving many small businesses is to clone an existing project, rename it, and modify it until it suits the new client. This pattern feels fast in the first week and becomes catastrophic by the sixth month. Each clone drifts. Bugs fixed in one clone remain open in every other. Security patches applied to one are forgotten in the rest. Knowledge of "which version is correct" lives only in the heads of the engineers who happened to be present. Over time, the agency that started with one good codebase ends up maintaining fifty subtly different ones, none of which can be trusted.

This is the architecture of compounding technical debt: every new client increases the maintenance burden without increasing the value of any prior client. It is forbidden on Business OS.

### Why a platform approach creates compounding value

The platform approach inverts the economics. Every new business that joins Business OS either uses existing capabilities (validating them through real use) or contributes new ones that, once built, become available to every business that follows. The cost of fixing a bug is paid once and benefits every tenant. The cost of adding a feature is paid once and becomes available to every tenant for which it is relevant. Over time, the marginal cost of onboarding a new business approaches the cost of configuration alone — because the code already exists.

This is the architecture of compounding value: each new client increases the platform's capability rather than its maintenance burden. Every architectural decision documented below exists to protect this property.

---

## 2. Architectural Layers

Business OS is organized into four layers. Each layer is more specific than the one below it, and each layer is strictly prohibited from depending on a layer more specific than itself. Dependencies flow upward in the layer list, never downward.

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 4 — Business Projects   Custom implementations       │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — Templates            Pre-assembled deployment kits │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Reusable Components Industry-specific modules    │
├─────────────────────────────────────────────────────────────┤
│  Layer 1 — Core                Universal foundation         │
└─────────────────────────────────────────────────────────────┘

Dependency direction: Layer N may depend on Layer N-1, never the reverse.
```

### Layer 1: Core

The `core/` directory contains **universal capabilities** — functionality that every business on the platform needs regardless of industry. A church needs authentication. A clinic needs authentication. A restaurant needs authentication. Therefore authentication lives in core, is built once to a high standard, and is inherited by all.

Examples of core capabilities:

- **Authentication** — identity verification, login, session management, password reset.
- **User management** — user profiles, account lifecycle, status transitions.
- **Organizations** — representation of a business entity on the platform.
- **Multi-tenancy** — tenant resolution, tenant context, tenant-aware data access.
- **Permissions** — roles, permission definitions, enforcement primitives.
- **Notifications** — email, SMS, in-app messaging, delivery tracking.
- **File management** — uploads, storage, access control, lifecycle.
- **Billing** — invoices, payments, receipts, plan management.
- **Reporting** — dashboards, exports, summaries, scheduled reports.
- **Audit logs** — immutable record of who did what, when, and from where.
- **Settings** — platform-wide and per-tenant configuration.

**Rules governing Layer 1:**

- **Core must never contain industry-specific logic.** A core module must not know that restaurants have menus, that schools have students, or that clinics have patients. If such knowledge appears necessary, the module belongs in Layer 2, not Layer 1.
- **Core must be stable.** Breaking changes to a core module ripple through every component, every template, and every business project. They are therefore treated as the most expensive changes on the platform and require the highest level of review.
- **Changes to core require careful review.** A core change must be reviewed by at least one architect-level maintainer, must be accompanied by a migration plan for existing consumers, and must be reflected in the changelog. AI-generated changes to core are subject to additional scrutiny — see `security-rules.md` and `git-workflow.md`.

### Layer 2: Reusable Components

The `reusable-components/` directory contains modules that represent **business capabilities** — concrete, named features that map directly to operations a real business performs. Where core answers "what does every business need?", Layer 2 answers "what does a restaurant need that a clinic does not?"

Industry-specific examples:

**Retail (`reusable-components/retail-shops/`):**
- **Inventory** — stock levels, reorder points, supplier links, variance tracking.
- **Point of sale** — checkout, payment, receipt, end-of-day reconciliation.
- **Product management** — catalog, pricing, variants, barcode assignment.

**Restaurant (`reusable-components/restaurants/`):**
- **Menu** — items, categories, pricing, availability, ingredient links.
- **Orders** — order capture, kitchen routing, fulfillment status.
- **Reservations** — table layout, time-slot booking, walk-in handling.

**School (`reusable-components/schools/`):**
- **Students** — enrollment, profiles, guardian links, academic record.
- **Attendance** — daily and per-session tracking, absence workflows.
- **Tuition** — fee plans, payment scheduling, outstanding balances.

**Rules governing Layer 2:**

- **Components must be reusable.** A component is built to serve every business in its industry, not one specific business. If a piece of logic is genuinely unique to a single customer, it does not belong here — it belongs in Layer 4.
- **Components must be configurable.** Variation between businesses in the same industry is handled through configuration (settings, feature flags, environment variables), not through forking the component. See Section 4 below.
- **Components must not contain customer-specific logic.** No business names, no per-customer if-statements, no hardcoded identifiers. A component that knows about a specific tenant has violated its own boundary and must be refactored.

### Layer 3: Templates

The `templates/` directory contains **deployment blueprints** — pre-assembled combinations of core capabilities and reusable components, packaged together as a ready-to-deploy starting point for a given industry. A template is a recipe, not a runtime.

A template declares:

1. Which core capabilities are included (all of them, by default).
2. Which reusable components are included.
3. The default configuration applied to each.
4. The data setup required to go live (e.g., a restaurant template requires a menu, a school template requires an academic year).

**Example — Restaurant Template**

A restaurant template typically bundles:
- Core (full set)
- Menu component
- Order component
- Customer component
- Optional add-ons: Reservations, Delivery, Loyalty — each toggleable per tenant.

**The purpose of templates is to accelerate onboarding.** Without a template, assembling a system for a new business means selecting components one by one, wiring them together, and applying sensible defaults — a process that, even with AI assistance, takes time and is error-prone. With a template, the same outcome is achieved by selecting a single starting point and then customizing only what is unique to this business. Templates turn a multi-day assembly task into a multi-hour configuration task.

### Layer 4: Business Projects

The `business-projects/` directory contains **implementations for real customers**. Each project is a concrete instantiation of a template, customized with the business's branding, data, workflows, and any genuinely unique features they require.

**Rules governing Layer 4:**

- **Avoid creating unique code unless necessary.** The first question when onboarding a new business is never "what should we build?" — it is "what does the platform already provide that we can configure?" Unique code is a last resort, not a starting point.
- **Prefer configuration.** Variation between two businesses in the same industry should, wherever possible, be expressed as a difference in configuration rather than a difference in code. Two restaurants with different menus are not two codebases — they are two tenants with different `menu` data.
- **Custom features should be evaluated for promotion.** When a custom feature built for one business turns out to be broadly useful, it must be promoted: from the business project, up into a reusable component, and eventually — if universally relevant — into a template or even into core. This promotion flow is described in detail in `component-standard.md`, Section 2.

---

## 3. Multi-Tenant Architecture Rules

Business OS serves many businesses from a single platform. This is not an optimization layered on top of an originally single-tenant design — multi-tenancy is a foundational architectural decision that shapes every data model, every API, and every authorization check on the platform.

**One platform serves many businesses.** A business is called a **tenant**. Every record on the platform — a customer, an order, an invoice, a patient, a student — belongs to exactly one tenant, and that ownership is enforced at every layer from the database to the UI.

**Rules:**

- **Every business is a tenant.** There are no special-case businesses that bypass the tenant model. If a business appears to require a non-tenant deployment, the requirement is wrong, or the platform is missing a capability that should be added to core.
- **Tenant data must be isolated.** A query that returns results across tenants is a critical bug, regardless of whether any tenant has actually noticed. Isolation is verified by automated tests, not by good intentions.
- **No business can access another business's data.** This applies to read access, write access, export access, reporting, search, and any future capability. The platform must behave as if every other tenant's data does not exist.
- **Tenant identification must happen at the application level.** Every incoming request is resolved to a tenant context before any business logic runs. There is no code path that operates on tenant data without first establishing which tenant the request belongs to.
- **Authorization must be enforced everywhere.** Authentication (who is the user?) and authorization (what is this user allowed to do, in this tenant?) are separate concerns and both are mandatory on every protected endpoint. See `security-rules.md` Section 3.

### Anti-pattern: Separate application per business

The bad architecture is to deploy a complete, isolated application for each customer — its own codebase, its own database, its own deployment. This is the copy-and-modify anti-pattern described in Section 1, applied at the infrastructure level. It multiplies maintenance cost linearly with the number of customers, prevents any improvement from benefiting more than one tenant, and makes security patches a logistical nightmare. It is forbidden on Business OS.

### Reference pattern: One platform + many tenants

The good architecture is a single deployed platform that resolves, per request, which tenant the request belongs to, and enforces tenant isolation at every layer. Improvements benefit all tenants. Security patches apply once. The cost of serving the Nth tenant approaches the marginal cost of tenant configuration. This is the architecture Business OS uses, and every architectural decision must preserve it.

---

## 4. Configuration Over Customization

When two businesses in the same industry differ, the platform's first response must always be **configuration**, never code. Configuration is cheaper, safer, and reusable; code customization is expensive, risky, and tenant-specific.

**The preferred pattern:**

```
Business settings
    +
Enabled modules (feature flags)
    +
Configuration values
    =
A working, distinct business system
```

**The forbidden pattern:**

```
Clone the codebase
    +
Modify the source
    =
A divergent, unmaintainable fork
```

### Example — Two restaurants, same platform, different configuration

**Restaurant A:**
- Delivery module: enabled
- Reservations module: disabled
- Default currency: HTG
- Tax rate: 10%

**Restaurant B:**
- Delivery module: disabled
- Reservations module: enabled
- Default currency: USD
- Tax rate: 7%

Both restaurants run on the same platform, share the same codebase, and inherit the same improvements over time. The differences are expressed entirely as configuration values. Neither business has its own fork. Neither business is invisible to the other's improvements. When a bug in the delivery module is fixed, Restaurant A benefits immediately — and Restaurant B, even though it does not use delivery, is unaffected because the module is simply disabled.

This pattern is mandatory. Any proposal that requires forking code to differentiate two businesses in the same industry must be rejected at review, and the configuration gap must instead be expressed as a missing configuration option, a missing feature flag, or a missing reusable component — in that order of preference.

---

## 5. AI Development Rules

AI coding agents are first-class contributors on Business OS. They are expected, reviewed, and held to the same standards as human contributors. They are also subject to additional rules below, because the failure modes of AI-generated code are different from those of human-written code.

**Before creating anything, the AI must:**

1. **Search existing components.** Query the `reusable-components/` directory and any indexed catalog of components. The new requirement may already be satisfiable by an existing module with minor configuration.
2. **Check core capabilities.** The requirement may not need an industry-specific component at all — it may be expressible purely in terms of core (e.g., notifications, billing, audit).
3. **Check templates.** The requirement may already be part of an existing template's default configuration.
4. **Determine whether reuse is possible.** Only after steps 1–3 have been completed and documented may the AI proceed to propose new code. If reuse was not possible, the AI's response must include an explicit explanation of why each existing candidate was insufficient.

**The AI must never:**

- **Create duplicate modules.** A second inventory component is a defect, not a feature. The first one must be improved, not bypassed.
- **Create random folder structures.** Folder structure is defined in `component-standard.md` Section 3 and in the root `README.md`. Deviations require explicit architect approval.
- **Ignore existing conventions.** Naming, file layout, configuration format, and integration patterns are documented precisely so that AI output is predictable and reviewable. An AI that ignores conventions produces output that cannot be efficiently reviewed.
- **Rewrite working systems unnecessarily.** "I would have written this differently" is never sufficient justification for a rewrite. Refactors must be motivated by a concrete, measurable problem and reviewed as carefully as new features.

---

## 6. Architecture Decision Rules

Every major architectural decision — choice of database, introduction of a new external dependency, change to the multi-tenancy model, addition of a new core module, modification to the layer dependency rules — must be documented as an Architecture Decision Record (ADR) and must explicitly consider the following dimensions:

- **Scalability** — How does this decision behave at 10× and 100× the current tenant count? At 10× and 100× the current data volume? Does it introduce a bottleneck that is invisible at small scale but catastrophic at scale?
- **Security** — Does this decision affect tenant isolation, authentication, authorization, or the handling of sensitive data? Does it introduce a new attack surface? See `security-rules.md`.
- **Maintenance cost** — How expensive is this decision to maintain over five years? Does it require specialized knowledge that will be hard to transfer? Does it increase the cognitive load on every future contributor?
- **Future reuse** — Does this decision make the platform more reusable, or less? Does it lock a capability into a specific industry or tenant when it could have been built generically?
- **AI compatibility** — Can an AI coding agent reason about this decision and produce code that conforms to it? Does the decision introduce implicit knowledge that is hard to communicate in documentation? The platform's reliance on AI assistance means decisions that are hard for AI to follow are decisions that slow down every future contribution.

A decision that scores well on some of these dimensions but poorly on others is not automatically rejected — but the tradeoff must be explicit, documented, and signed off by an architect. Silent tradeoffs are forbidden.
