# Building for a Client — The AI Playbook

> **Read this entire document before building any website for a client.**
>
> This is the playbook every AI agent follows when a human says "build a website for [client]." It exists to ensure every client gets a website designed specifically for them, powered by the same ready-made backend.

---

## The One Rule

**The backend is ready. The UI is never pre-made. Every website is designed from scratch.**

If you remember nothing else from this document, remember that.

---

## The Factory Analogy

Business OS is a car factory. The backend components (`core/` + `reusable-components/`) are the engine, wheels, doors, suspension, and flywheel — all ready, all tested, all interchangeable. When a customer orders a car, the factory does not pull a pre-built SUV off the shelf and paint it a different color. The factory builds the SUV from scratch — designs the body, shapes the chassis, polishes the finish — using the same engine and wheels that every other car uses.

When a client asks for a website, you do not pull a pre-built template off the shelf and swap the logo. You design the website from scratch — choose the layout, the colors, the user flow, the screens — using the same backend components that every other client uses.

---

## Step 1 — Listen to the Client

Before writing a single line of code, you must understand the client. Ask:

1. **What does the business do?** Not just "it's a restaurant" — what kind? Fine dining? Food truck? Bakery? Delivery-only cloud kitchen? Each is a different website.
2. **Who are the customers?** Tourists? Locals? Corporate accounts? The UI differs dramatically.
3. **What does the client want the website to achieve?** Online ordering? Reservations? Just a menu display? A loyalty program? Each is a different set of screens.
4. **What is the client's brand?** Colors, tone, personality. A casual beachside restaurant and a formal fine-dining establishment use the same backend but need completely different visual identities.
5. **What devices do the customers use?** In Haiti, the answer is almost always mobile-first. But confirm.
6. **What language(s)?** French? Haitian Creole? English? Bilingual?

Do not proceed to Step 2 until you can answer all six questions. If the human giving you the task doesn't know the answers, ask them to find out — or make reasonable assumptions and state them explicitly.

---

## Step 2 — Select Backend Components from the Inventory

Based on what the client needs, select which `reusable-components/` modules to use. You are selecting from a catalog of 65 ready components — you do not write any backend code.

### How to select

Read each component's `README.md` to understand what it does. The full catalog is in `reusable-components/README.md` and `reusable-components/library-manifest.json`.

### Example — Restaurant with online ordering

Client wants: customers can browse the menu, place an order, pay online, and get a confirmation.

Components to use:
- `restaurant-menu` — manage menu items, categories, availability
- `restaurant-order-management` — capture orders, track status (placed → in_kitchen → ready → served)
- `restaurant-billing` — generate bills, record payment
- `payments-or-collections` — record the actual payment (cash, card, mobile money)
- `messaging-center` — send order confirmation via SMS/WhatsApp
- `notifications-center` — in-app notification when order status changes
- `restaurant-ingredient-tracking` — auto-deplete stock when items are sold (if the client wants this)

Components NOT to use (even though they exist):
- `restaurant-table-management` — the client said online ordering, not dine-in
- `restaurant-reservations` — same reason
- `restaurant-delivery-management` — the client didn't mention delivery
- `restaurant-shift-management` — that's an internal ops concern, not customer-facing

### Example — Clinic with appointment booking

Client wants: patients can book appointments, see their prescription history, and get reminders.

Components to use:
- `clinic-patient-management` — patient profiles (with audit-on-read for privacy)
- `clinic-appointments` — scheduling with conflict detection
- `clinic-medical-records` — consultation notes (audited)
- `clinic-prescriptions` — prescription history
- `clinic-consent` — capture consent for data use
- `clinic-reminders` — appointment reminders via SMS
- `messaging-center` — send the reminders
- `clinic-billing` — consultation fees

---

## Step 3 — Design the UI from Scratch

This is where you earn your keep. The backend is the same for every client in an industry. The UI is what makes each client's website unique.

### What "from scratch" means

- **Do not copy a previous client's UI.** Even if the previous client was also a restaurant.
- **Do not use a pre-built template.** There are no templates in this platform — by design.
- **Do not assume the layout.** A bakery's website should not look like a fine-dining restaurant's website, even though both use `restaurant-menu`.
- **Design based on the client's brand.** Choose colors, typography, spacing, imagery that reflect this specific business.

### What you DO build

- **React components** (or whatever framework the human specifies) — written fresh for this client
- **Page layouts** — designed for this client's user flow
- **User flows** — based on how this specific business operates
- **Visual design** — colors, typography, spacing, animations, all chosen for this client
- **Mobile-first responsive patterns** — Haitian users are mostly on phones

### What you do NOT build

- **Backend logic.** Every data operation calls an existing HTTP endpoint.
- **Database queries.** The backend handles persistence.
- **Authentication.** The backend handles login, sessions, password hashing.
- **Authorization.** The backend checks permissions on every request.
- **Audit logging.** The backend writes audit entries automatically.

### Design principles

1. **Mobile-first.** Most Haitian users access the web on phones. Design for small screens first, then scale up.
2. **Offline-tolerant where possible.** Internet in Haiti is unreliable. Show cached data when the network is down; sync when it's back.
3. **Low-bandwidth.** Compress images, minimize JavaScript, prefer server-rendered or static-generated pages where possible.
4. **Multilingual-ready.** Even if the first version is one language, structure the UI so a second language can be added without rewriting.
5. **Accessible.** Follow WCAG basics — sufficient contrast, readable font sizes, keyboard navigation.

---

## Step 4 — Wire the UI to the Backend

Every UI action maps to an HTTP endpoint that already exists. The full API is:

- **Core routes** (16 endpoints): identity, organizations, authorization, audit-log
- **Component routes** (150 endpoints): every operation from every reusable component

### How to call the API

Every request needs:
1. **`Authorization: Bearer <token>`** header — obtained from `POST /v1/identity/login`
2. **`X-Tenant-Slug: <slug>`** header — the client's organization slug (from `POST /v1/organizations`)
3. **JSON body** for POST/PATCH requests
4. **Query params** for GET requests

### Example flow — a customer placing an order

1. Customer visits the website → the frontend loads the menu via `GET /v1/restaurant-menu/list-active-menu-items` (public read, or use a staff token)
2. Customer adds items to cart → frontend holds the cart in state
3. Customer checks out → frontend calls `POST /v1/restaurant-order-management/create-order` with the cart items
4. Frontend calls `POST /v1/restaurant-billing/generate-bill` with the order id
5. Frontend calls `POST /v1/payments-or-collections/record-payment` with the bill id
6. Backend emits a notification via `messaging-center` (if wired)
7. Frontend shows the customer the order confirmation

You write zero backend code for any of this. You just call the endpoints.

### Where to find the API contract

- Each component's `api/contract.ts` — the HTTP route declarations
- Each component's `documentation/contract.md` — human-readable operation reference
- Each component's `backend/types.ts` — the canonical TypeScript types (if docs and types disagree, types win)
- The `core/http/generated-component-routes.ts` file — the full list of 150 component routes

---

## Step 5 — Deploy

### Backend

The backend runs with zero external setup:

```bash
npm install
npm start    # → http://localhost:3000, SQLite database auto-created at ./data/business-os.db
```

For production, set environment variables:
- `PORT` — the port to listen on (default 3000)
- `DATABASE_PATH` — path to the SQLite file (default `./data/business-os.db`)

### Frontend

The frontend is a static build. Build it with whatever tool the human specifies (Vite, Next.js, etc.), then serve the static files from any static host (Vercel, Netlify, Cloudflare Pages, or even the same server as the backend).

Point the frontend at the backend's URL. In development, the frontend calls `http://localhost:3000`. In production, it calls the deployed backend URL.

---

## What You Must NEVER Do

### Never copy a previous client's UI

Every client gets a from-scratch design. If client A is a restaurant and client B is also a restaurant, you do not copy client A's UI and change the colors. You design client B's UI fresh, based on client B's brand and needs.

The backend components are shared — that's the point. The UI is never shared.

### Never write backend business logic in the client project

If the backend doesn't support something the client needs, you have two options:
1. **Extend the reusable component** — add the operation to `reusable-components/<component>/backend/logic.ts`, with tests, documentation, and an API contract. This benefits every future client in that industry.
2. **Add a new reusable component** — if the need is genuinely new and not covered by any existing component.

You do **not** write one-off backend code in `business-projects/<client>/`. That violates the architecture (`architecture-rules.md` §2) and defeats the purpose of the platform.

### Never skip the listening step

Building the wrong website fast is worse than building the right website slowly. If you don't understand the client's needs, ask. If the human giving you the task doesn't know, ask them to find out. Do not assume.

### Never assume the industry defines the website

Two restaurants can need completely different websites:
- A food truck needs a simple menu + location page
- A fine-dining restaurant needs reservations + tasting menu + wine pairings
- A bakery needs online ordering + pickup scheduling
- A cloud kitchen needs delivery-only ordering + driver management

All four use `restaurant-menu` + `restaurant-order-management` + `restaurant-billing` on the backend. All four get completely different UIs.

---

## How to Extend the Backend (if a client needs something new)

If a client needs a capability that no existing component provides:

1. **Check if an existing component can be configured to do it.** Most components have config options. Read the component's `config/defaults.ts` and `README.md`.
2. **If not, extend the component.** Add the operation to the component's `backend/logic.ts`, following the standard structure. Add tests. Update the `README.md` and `api/contract.ts`. Run the route generator (`python3 scripts/generate_component_routes.py`) to wire the new route.
3. **If the need is genuinely new (not covered by any existing component), create a new component.** Follow `ai-instructions/component-standard.md` exactly. Place it in the appropriate industry folder. Document it. Test it.

The goal is that the next client who needs the same capability inherits it for free — that's the compounding value of the platform.

---

## Checklist Before You Ship a Client Website

- [ ] You can answer all six questions from Step 1 (Listen)
- [ ] You selected only the backend components the client actually needs (not all of them)
- [ ] You designed the UI from scratch — no copied templates, no previous client's design
- [ ] The UI is mobile-first (tested on a 375px viewport)
- [ ] Every UI action that needs data calls an existing backend endpoint
- [ ] You wrote zero backend business logic in the client project
- [ ] The frontend builds and runs against `npm start` on the backend
- [ ] You documented which components the client uses (in the client project's README)

---

## Summary

The backend is a factory with 65 ready components and a 166-endpoint HTTP API. Your job as an AI agent is to:
1. Listen to the client
2. Select the right components from the catalog
3. Design a from-scratch UI that fits the client's brand and needs
4. Wire the UI to the existing API
5. Ship

You are not building a backend. You are building a custom car body on top of a ready engine.
