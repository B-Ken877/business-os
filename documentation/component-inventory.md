# Component Inventory — Quick Reference

> A condensed catalog of every ready backend component. Use this to select components when building a client website. For full details, read the component's `README.md`.

**Last updated:** reflects the state of `main` as of the latest commit.
**Total:** 65 components, 150 HTTP routes, 1,151 tests.

---

## How to read this catalog

Each entry shows:
- **ID** — the stable component identifier, used in the HTTP path (`/v1/{id}/{operation}`)
- **What it does** — one line
- **Key operations** — the main HTTP endpoints
- **Permissions** — the permission strings the component checks

To call any operation: `METHOD /v1/{id}/{operation-name-kebab-case}` with `Authorization: Bearer <token>` and `X-Tenant-Slug: <slug>` headers.

---

## Cross-Cutting (`cross-cutting/`) — 10 components

Used across multiple industries. These are configurable business capabilities, not platform primitives.

| ID | What it does | Key operations |
|---|---|---|
| `messaging-center` | Send messages via SMS/email/WhatsApp/in-app | `send-message`, `mark-delivered`, `list-messages` |
| `document-management` | File uploads, attachments, metadata, quotas | `upload-document`, `list-documents-for-entity`, `soft-delete-document` |
| `reporting-dashboard` | Define metrics, compute values, dashboards | `define-metric`, `record-metric-value`, `get-metric-series` |
| `notes-and-comments` | Internal notes, threaded comments on any entity | `create-note`, `list-notes-for-entity`, `delete-note` |
| `activity-timeline` | Per-entity operational event history | `record-event`, `list-events-for-entity` |
| `search-and-filter` | Reusable list search, filter, sort, pagination | `run-query`, `save-query` |
| `notifications-center` | In-app notification inbox per user | `push-notification`, `list-unread-for-current-user`, `mark-read` |
| `forms-and-intake` | Configurable forms, submission handling | `define-form`, `publish-form`, `submit-form` |
| `payments-or-collections` | Payment recording, balances, refunds | `record-payment`, `refund-payment`, `list-payments-for-invoice` |
| `roles-and-permissions-ui` | Role definitions, permission catalog | `define-role`, `list-roles`, `list-permissions-for-role` |

---

## Retail Shops (`retail-shops/`) — 9 components

| ID | What it does | Key operations |
|---|---|---|
| `retail-product-catalog` | Products, categories, pricing, photos | `create-product`, `update-price`, `archive-product` |
| `retail-inventory` | Stock levels, movements, low-stock thresholds | `adjust-stock`, `set-low-stock-threshold`, `list-movements-for-product` |
| `retail-point-of-sale` | Checkout, cart, totals, payment recording | `checkout`, `get-sale` |
| `retail-supplier-management` | Suppliers, purchase orders, receipts | `create-supplier`, `create-purchase-order`, `mark-purchase-order-received` |
| `retail-stock-alerts` | Low-stock and out-of-stock alert emission | `evaluate-stock-level`, `list-active-alerts` |
| `retail-customer-management` | Customer records, loyalty notes, status | `create-customer`, `update-status`, `add-loyalty-note` |
| `retail-barcode-scanning` | Barcode registration and lookup | `register-barcode`, `lookup-barcode` |
| `retail-sales-reports` | Daily sales summaries, top products | `compute-daily-summary` |
| `retail-promotions` | Discounts, bundles, time-bounded campaigns | `create-promotion`, `activate-promotion`, `list-active-promotions` |

---

## Restaurants (`restaurants/`) — 10 components

| ID | What it does | Key operations |
|---|---|---|
| `restaurant-menu` | Menu items, categories, modifiers, availability | `create-menu-item`, `set-availability` |
| `restaurant-order-management` | Order capture, status, fulfillment | `create-order`, `advance-order-status`, `cancel-order` |
| `restaurant-table-management` | Tables, seating, occupancy | `create-table`, `assign-order-to-table`, `release-table` |
| `restaurant-kitchen-display` | Kitchen tickets, prep status, station routing | `create-ticket`, `mark-ticket-ready`, `list-tickets-for-station` |
| `restaurant-reservations` | Booking, table assignment, reminders | `create-reservation`, `cancel-reservation` |
| `restaurant-delivery-management` | Delivery orders, driver assignment | `assign-driver`, `confirm-delivered` |
| `restaurant-ingredient-tracking` | Ingredient stock, recipe-linked depletion | `add-ingredient-stock`, `deplete-for-menu-item` |
| `restaurant-billing` | Bills, service charges, payment status | `generate-bill`, `mark-paid` |
| `restaurant-shift-management` | Staff shifts, handoff notes | `create-shift`, `add-handoff-notes` |
| `restaurant-promotions` | Coupons, happy hour, combo offers | `create-coupon`, `redeem-coupon` |

---

## Schools (`schools/`) — 10 components

| ID | What it does | Key operations |
|---|---|---|
| `school-student-enrollment` | Student onboarding, enrollment status | `enroll-student`, `update-enrollment-status` |
| `school-attendance` | Attendance recording, summaries | `record-attendance`, `compute-attendance-rate` |
| `school-tuition-management` | Tuition plans, payments, balances | `create-tuition-plan`, `record-tuition-payment`, `compute-outstanding-balance` |
| `school-grading` | Grades, assessments, averages | `record-grade`, `compute-student-average` |
| `school-class-scheduling` | Timetable, rooms, teachers, conflict detection | `schedule-session`, `list-sessions-for-teacher` |
| `school-parent-communication` | Parent messages, announcements | `send-parent-message`, `list-messages-for-student` |
| `school-exams` | Exam periods, grading progress | `create-exam`, `mark-exam-graded` |
| `school-certificates` | Certificate issuance, revocation | `issue-certificate`, `revoke-certificate` |
| `school-teacher-management` | Teacher profiles, subjects | `create-teacher`, `list-teachers` |
| `school-student-portal` | Student-facing portal contract | `start-session`, `end-session` |

---

## Churches (`churches/`) — 8 components

| ID | What it does | Key operations |
|---|---|---|
| `church-member-management` | Member directory, family grouping, visibility | `create-member`, `list-visible-members`, `update-own-visibility` |
| `church-donations` | Tithes, offerings, pledges, giving history | `record-donation`, `compute-member-giving-total` |
| `church-events` | Service events, registrations | `create-event`, `register-for-member` |
| `church-groups` | Small groups, ministry teams | `create-group`, `join-group` |
| `church-attendance` | Service attendance, decline detection | `record-attendance`, `is-declining` |
| `church-announcements` | Public and internal announcements | `publish-announcement`, `list-active-announcements` |
| `church-volunteers` | Volunteer records, assignments | `create-volunteer`, `assign-volunteer` |
| `church-sermons` | Sermon archive, series, media references | `record-sermon`, `list-sermons-by-speaker` |

---

## Clinics (`clinics/`) — 10 components

> These handle medical data. Every read of patient data is audited. See `security-rules.md` §5.

| ID | What it does | Key operations |
|---|---|---|
| `clinic-patient-management` | Patient profiles, MRN, audit-on-read | `create-patient`, `get-patient` |
| `clinic-appointments` | Scheduling, conflicts, reminders | `schedule-appointment`, `cancel-appointment` |
| `clinic-medical-records` | Consultation notes, audit-on-read | `create-record`, `list-records-for-patient` |
| `clinic-prescriptions` | Prescriptions, refills, status | `create-prescription`, `refill-prescription` |
| `clinic-triage` | Visit reason, symptoms, urgency classification | `record-triage`, `list-emergency-triage` |
| `clinic-billing` | Consultation fees, invoices, payments | `generate-invoice`, `mark-invoice-paid` |
| `clinic-lab-orders` | Lab test orders, result tracking | `order-lab-test`, `record-result` |
| `clinic-consent` | Consent capture, revocation, audit-on-check | `grant-consent`, `revoke-consent`, `has-active-consent` |
| `clinic-reminders` | Appointment, medication, follow-up reminders | `schedule-reminder`, `cancel-reminder` |
| `clinic-staff-management` | Doctors, nurses, assistants, roles | `create-staff`, `list-doctors` |

---

## Service Businesses (`service-businesses/`) — 8 components

For businesses that sell services rather than products: salons, repair shops, consultancies, cleaning services.

| ID | What it does | Key operations |
|---|---|---|
| `service-catalog` | Services, pricing, durations | `create-service`, `list-active-services` |
| `service-quotes` | Estimates, approval flow | `create-quote`, `approve-quote` |
| `service-booking` | Appointment booking, conflict detection | `create-booking`, `mark-completed`, `mark-no-show` |
| `service-job-tracking` | Work orders, task progress | `create-job`, `add-task`, `complete-task` |
| `service-invoicing` | Invoices, payments, balances | `generate-invoice`, `mark-paid` |
| `service-customer-management` | Customer records, preferences | `create-customer`, `set-preferences` |
| `service-feedback` | Ratings, comments, follow-up tracking | `submit-feedback`, `list-needs-follow-up` |
| `service-scheduling` | Staff availability, time off | `set-working-hours`, `is-available` |

---

## Core (`core/`) — 7 modules

The engine. Every business needs these. Not in the component catalog because they're platform-wide, but listed here for completeness.

| Module | What it does | Key HTTP routes |
|---|---|---|
| `identity` | Users, passwords, sessions | `POST /v1/identity/register`, `POST /v1/identity/login`, `GET /v1/identity/me` |
| `organizations` | Tenants, membership, invitations | `POST /v1/organizations`, `GET /v1/organizations/mine` |
| `authorization` | RBAC, roles, permissions | `GET /v1/authorization/roles`, `POST /v1/authorization/grants` |
| `audit-log` | Queryable audit trail | `GET /v1/audit-log`, `GET /v1/audit-log/count` |
| `http` | The Hono server + middleware | (the server itself) |
| `persistence-sqlite` | SQLite database adapter | (internal) |
| `platform` | Universal primitives (TenantContext, Result, etc.) | (internal) |

---

## How to use this catalog

1. **Identify the client's industry** — which of the 7 verticals fits?
2. **Read that vertical's components** — which does the client need?
3. **Always include cross-cutting components** — `messaging-center`, `notifications-center`, `payments-or-collections`, and `activity-timeline` are useful for almost every website.
4. **Check the component's README** for full details, configuration options, and limitations.
5. **Call the HTTP endpoints** — no backend code to write.

For the full playbook on building a client website, see `ai-instructions/building-for-a-client.md`.
