# Component Standard

> This document defines how reusable components are designed, structured, documented, and promoted within Business OS. It is mandatory reading for every human developer and AI coding agent before any new component is created.

---

## 1. Definition of a Component

A component in Business OS is **a complete, self-contained business capability** — not a UI fragment, not a single page, and not a button. A component is the smallest unit of business functionality that can be reasoned about, configured, and reused independently across multiple businesses and industries.

When a developer (or an AI agent) thinks "I need to build the inventory feature," what they should actually be thinking is "I need to build or extend the `inventory-management` component." The component is the entire capability: the data it stores, the logic it enforces, the interfaces it exposes, the rules it follows, and the documentation that describes it. Reducing a component to just its user interface is one of the most common and most damaging mistakes, because it produces UI code with no reusable backbone behind it — every new business then rebuilds the same backend, the same data model, and the same rules, while the UI gets copy-pasted.

A complete component is composed of all of the following elements working together:

- **Business logic** — The rules, workflows, state machines, and calculations that make the capability useful. This is the core of the component, not an afterthought.
- **Data models** — The schemas, entities, relationships, and migrations that persist the component's state. A component owns its data; other components interact with it through interfaces, not through direct table access.
- **APIs** — The programmatic surface through which other components, the frontend, and external integrations interact with the component. APIs are the contract, and contracts must be stable.
- **Permissions** — The role-based and tenant-scoped access rules that govern who can call which API and read or write which data. A component without permissions is not ready for production.
- **Documentation** — A README and supporting documentation that explain what the component does, how to configure it, what it depends on, and what its limitations are. Undocumented components cannot be reused.
- **Tests** — Automated tests that verify the component behaves as documented. Tests are what allow the component to be safely modified later without fear of silent regressions.
- **Configuration** — A clear, versioned configuration schema that lets each tenant enable, disable, or tune the component's behavior without touching its source code.

If any of these elements is missing, the artifact is not yet a component — it is a draft. Drafts are allowed in `business-projects/` while they mature, but they cannot be promoted into `reusable-components/` until they satisfy the full definition above.

---

## 2. Component Lifecycle

Components are not born reusable. They mature through a defined lifecycle, and promotion from one stage to the next is a deliberate decision — not an automatic consequence of time or usage. The lifecycle below is mandatory for every component in the platform.

```
Idea
  ↓
Prototype
  ↓
Reusable Component
  ↓
Template Integration
  ↓
Core Promotion (if universal)
```

### Stage 1 — Idea

An idea is a recognized business need that no existing component fully satisfies. At this stage there is no code — only a written problem statement, a sketch of the proposed capability, and a justification for why existing components cannot be stretched to cover the need. Ideas are captured as issues or short design notes, never as ad-hoc code committed directly to `reusable-components/`.

**Promotion criteria to Prototype:** The idea has a clear owner, a clear target industry, and at least one real business that would use it.

### Stage 2 — Prototype

A prototype is a working but unstable implementation that lives inside a `business-projects/` directory, not in `reusable-components/`. Its purpose is to validate the design against a real business's needs, discover the unknown unknowns, and iterate quickly without worrying about generalizing for other businesses yet. Prototypes are explicitly allowed to contain customer-specific assumptions, because their job is to prove the concept, not to be reusable.

**Promotion criteria to Reusable Component:**
- The prototype has stabilized — the data model, the API surface, and the configuration options are no longer changing week to week.
- At least one real business is using it in production.
- Customer-specific assumptions have been removed or extracted into configuration.
- The component satisfies every requirement in Section 3 (Standard Component Structure) and Section 4 (Documentation Requirements).

### Stage 3 — Reusable Component

The component is promoted into `reusable-components/<industry>/` and is now available to every business in that industry. From this point forward, changes to its public API and configuration schema must be backward-compatible or follow a documented deprecation path. The component is now part of the platform, and breaking it breaks every business that depends on it.

**Promotion criteria to Template Integration:** The component has been adopted by at least two businesses, demonstrating that it is genuinely reusable and not a single-customer artifact dressed up as a component.

### Stage 4 — Template Integration

The component is included in one or more industry templates in `templates/`. New businesses in that industry now receive the component by default when their template is applied. This is where the component starts delivering compounding value — every new business in the industry gets it for free.

**Promotion criteria to Core Promotion:** A clear case has emerged that the component is needed not just by one industry, but by virtually every business the platform serves, regardless of industry.

### Stage 5 — Core Promotion (if universal)

A component is promoted into `core/` only when it is genuinely universal — every business, in every industry, needs it. Promotion to core is rare and consequential: core components become the foundation that everything else depends on, so they must meet the highest stability, security, and documentation standards on the platform. Examples of capabilities that belong in core include authentication, user management, organizations, and audit logs — capabilities without which no business can operate.

Promotion decisions are recorded in the commit history and in `documentation/` so the reasoning behind each promotion can be reviewed later.

---

## 3. Standard Component Structure

Every component in `reusable-components/` must follow the directory structure below. Consistency at this level is what makes components predictable — both for human developers, who can navigate any component without first learning its layout, and for AI agents, which rely on consistent structure to locate and reason about code.

```
component-name/
├── README.md
├── documentation/
├── frontend/
├── backend/
├── database/
├── api/
├── config/
├── tests/
└── examples/
```

### README.md

The entry point for the component. It must satisfy every requirement in Section 4 (Component Documentation Requirements). The README is the contract between the component and its consumers — human and AI — and it must be accurate, complete, and current.

### documentation/

Extended documentation that does not fit in the README: design decisions, architecture diagrams, data flow descriptions, integration guides, and migration notes for backward-incompatible changes. This folder is what allows a new contributor (or a new AI agent) to understand the component deeply without having to reverse-engineer it from code.

### frontend/

The user-interface layer of the component: pages, components, styles, and any client-side logic. The frontend must communicate with the backend exclusively through the documented API surface — never by reaching directly into another component's data or backend code. This isolation is what keeps components composable.

### backend/

The business logic, services, and workflows that implement the component's behavior. This is where the rules of the capability live: validations, state transitions, calculations, and integrations with other components through their APIs. Backend code must not depend on the frontend, so that the same component can be driven by a web UI, a mobile UI, or a pure API consumer.

### database/

The component's data models, schemas, migrations, and seed data. The component owns its data — other components must not read or write its tables directly. Cross-component data access always goes through the API layer, which is the only legitimate way to enforce tenant isolation, permissions, and audit logging.

### api/

The public API surface of the component: route definitions, request/response schemas, authentication requirements, and versioning. The API is the component's contract with the rest of the platform. Changes to the API must follow the versioning and deprecation rules described in the component's documentation, so consumers are never broken silently.

### config/

The configuration schema and default values that let each tenant tune the component's behavior. Configuration is preferred over customization — when a business needs the component to behave differently, the first response must be "can this be a configuration option?" rather than "let me fork the code." Configuration is what allows one component to serve many businesses.

### tests/

Automated tests covering business logic, API behavior, permissions, and edge cases. Tests are what allow the component to be modified safely across its lifetime — without them, every change is a gamble, and AI-assisted changes become dangerous rather than helpful. A component without tests is not ready for `reusable-components/`.

### examples/

Concrete, runnable examples showing how the component is configured, integrated, and used. Examples are especially important for AI agents, which use them as templates for assembling new business projects. An example that shows a restaurant enabling the `reservations` component is worth more than a paragraph of prose describing how to do it.

---

## 4. Component Documentation Requirements

Every component's README must include the sections below. These are not optional headers — each one carries information that is necessary for the component to be reused safely, and skipping any of them is grounds for blocking promotion into `reusable-components/`.

- **Purpose** — What the component does, in one or two sentences. A reader should understand the component's reason for existing before reading anything else.
- **Business problem solved** — The real-world pain point the component addresses. This grounds the component in a concrete need and helps future contributors decide whether to extend it or build something new.
- **Supported industries** — Which industries the component is designed for (e.g. restaurants, retail, schools). This is how the platform knows where to look when assembling a new business's system.
- **Features** — A list of the capabilities the component provides. Features should be described at the level of "what can the user do," not "what functions exist in the code."
- **Dependencies** — Other components or core modules the component relies on. Hidden dependencies are forbidden — every dependency must be declared here so consumers can plan for them.
- **Configuration options** — The complete list of configuration keys the component accepts, with their types, defaults, and effects. Configuration is how one component serves many businesses, so it must be documented exhaustively.
- **Permissions required** — The roles and permissions the component expects to exist in the platform, and which it creates or manages itself. Without this, the component cannot be wired into a tenant's authorization system correctly.
- **Data handled** — A description of the categories of data the component stores and processes, including whether any of it is sensitive (financial, medical, personal). This is essential for security review and for industry-specific compliance.
- **API interfaces** — A reference to the component's API surface, with enough detail that a consumer can call it without reading the implementation. Where full API documentation lives in `api/` or `documentation/`, the README must point to it clearly.
- **Limitations** — What the component does not do. Documenting limitations is just as important as documenting features, because it prevents consumers from making wrong assumptions and prevents AI agents from inventing capabilities that do not exist.
- **Future improvements** — Known gaps, planned enhancements, and ideas that have been considered but not yet implemented. This gives future contributors (human and AI) a starting point instead of having them rediscover the same ideas.

---

## 5. Component Quality Rules

Beyond structure and documentation, every component must satisfy the following quality rules. These rules are what separate a reusable component from a piece of code that merely happens to live in the `reusable-components/` folder.

- **Have clear boundaries.** A component must do one cohesive thing and do it well. If a component is doing two unrelated things, it should be split. Fuzzy boundaries produce fuzzy reuse and make every downstream decision harder.
- **Have documentation.** As emphasized throughout this document, undocumented code is unfinished code. Documentation is the contract that makes reuse possible and is the instruction manual that lets AI agents reason about the component correctly.
- **Avoid hidden dependencies.** Every dependency — on another component, on a core module, on a configuration value, on an external service — must be declared in the README and visible in `config/`. Hidden dependencies are the most common cause of components that work in one business and break in another.
- **Be testable.** The component must be structured so its behavior can be verified automatically, without manual setup. Tests must cover the documented features, the API surface, the permission rules, and the edge cases. Untestable components cannot be safely modified, and AI-assisted modifications become risky rather than helpful.
- **Be configurable.** Behavior that varies between businesses must be expressed as configuration, not as code forks. When a business needs something the component cannot do through configuration, that is a signal to either extend the component's configuration (if the need is broadly applicable) or to add the customization in the business project (if the need is genuinely unique).
- **Be reusable.** The component must be designed from the start to be used by more than one business. Single-customer artifacts belong in `business-projects/`, not in `reusable-components/`. If a component cannot be made reusable, it should not be promoted out of the prototype stage.

---

## 6. Component Naming Rules

Component names are permanent. They appear in folder paths, configuration keys, API URLs, documentation links, and AI agent instructions. Renaming a component after it has been adopted is expensive and disruptive, so names must be chosen carefully the first time.

**Naming principles:**
- Names must describe the **business capability**, not the implementation, the customer, or the timeframe.
- Names must be in **lowercase kebab-case** (words separated by hyphens), the standard for the platform.
- Names must be **specific enough to be unambiguous** but **general enough to survive implementation changes**. "inventory-management" is good; "shop-inventory-v2" is bad because it bakes in both a customer hint and a version.
- Names must **not include customer names, project codes, dates, or version numbers**. These belong in commit messages and changelogs, not in component identities.

**Good examples:**

- `inventory-management` — clear, describes the capability, survives implementation changes.
- `customer-management` — general, applies to any industry that has customers.
- `appointment-system` — specific enough to be unambiguous, general enough to serve clinics, salons, or any business that schedules appointments.
- `tuition-tracking` — describes the business capability, not the school that uses it.
- `reservation-system` — clear capability name, applicable to any business that takes reservations.

**Bad examples:**

- `my-new-feature` — describes nothing about the business capability.
- `shop-fix` — describes the action taken, not the capability provided.
- `temporary-code` — guarantees the code will outlive its name.
- `restaurant-a-inventory` — bakes a customer identifier into the component name, preventing reuse.
- `inventory-v2` — version belongs in changelogs and tags, not in the component identity.

When in doubt, choose the name that will still make sense to a reader who knows nothing about the project that produced the component.

---

## 7. AI Component Creation Rules

AI agents are expected to create and modify components within Business OS, but they must do so within the constraints defined throughout this document. The following rules apply specifically to AI-assisted component creation and must be enforced through review of every AI-generated contribution.

Before creating a new component, an AI agent must explicitly answer three questions in the PR description, in a dedicated section titled "Component Justification":

1. **Why is this component needed?** The agent must describe the business problem the component solves, with enough specificity that a human reviewer can confirm the problem is real and not invented. Vague justifications like "this might be useful" are not acceptable.
2. **Why can existing components not solve the problem?** The agent must demonstrate that it has searched `core/`, `reusable-components/`, and `templates/` for existing capabilities that could be extended or configured to address the need. If an existing component can be extended, the agent must extend it rather than create a new one. If an existing component can be configured, the agent must configure it rather than extend it. Creating a new component is the last resort, not the first instinct.
3. **Where does the component belong?** The agent must justify the proposed location — which industry folder under `reusable-components/`, or `other-businesses/` if no industry fits, or `business-projects/` if the component is not yet ready for reuse. The justification must reference the lifecycle criteria in Section 2.

Beyond justification, AI-generated components must satisfy every structural, documentation, quality, and naming requirement defined in this document. AI agents are not exempt from any rule in this document — if anything, they are held to a stricter standard, because AI-generated code is especially prone to subtle structural drift that only careful review can catch.

Finally, AI agents must never modify a reusable component's public API or configuration schema in a backward-incompatible way without explicit approval in the PR. The API is a contract, and contracts cannot be broken silently — even by an AI that believes the change is an improvement.
