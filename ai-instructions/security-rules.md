# Business OS Security Rules

> Security is not a feature. It is the foundation on which every other capability of the platform is built.

This document defines the security requirements that govern every module, every integration, and every commit in Business OS. It applies equally to human developers and to AI coding agents. There are no exceptions for "internal tools," "prototypes," or "we'll fix it later." If code touches user data, financial data, medical data, student data, or organizational data, the rules in this document are in force from the first line written.

---

## 1. Security Philosophy

Business OS is a multi-tenant platform that holds some of the most sensitive categories of personal and organizational data that exist in software. A clinic's patient records are medical data, protected in most jurisdictions by laws that carry serious penalties for exposure. A school's student records include information about minors, whose disclosure can cause direct harm to children and families. A business's financial data includes revenue figures, customer payment methods, and supplier terms, whose exposure can be commercially catastrophic. A church's member directory includes personal beliefs and giving histories, whose disclosure can endanger members in ways that are difficult to predict.

This is not a hypothetical concern. Small and medium businesses are the most frequent targets of opportunistic attacks precisely because they typically have weaker defenses than large enterprises while holding data of comparable sensitivity. A single breach can destroy a business's reputation, trigger legal liability, and most importantly, harm the real people whose data was exposed. For a platform whose entire value proposition is helping businesses operate digitally, a security failure is not a setback — it is a betrayal of the trust that makes the platform possible.

Security must therefore be designed into the architecture from the first commit, not bolted on after a breach. Every authentication flow, every API endpoint, every database query, and every configuration file must be built with the assumption that it will be attacked. The platform's job is not to be perfectly secure — no system is — but to make attacks expensive, detectable, and recoverable. The principles that follow translate that philosophy into concrete requirements.

---

## 2. Authentication Rules

Authentication is the process of verifying that a user is who they claim to be. It is the front door to the platform, and like any front door, it must be strong enough that attackers go looking for an easier target elsewhere.

### Password security

Passwords must never be stored in plaintext, reversible encryption, or any weak hashing scheme. Passwords must be hashed using a modern adaptive password hashing function — Argon2id, bcrypt with a work factor of at least 12, or scrypt with appropriate parameters — and each password must be hashed with a unique, cryptographically random salt. Password policies must enforce a minimum length (recommended 12 characters), reject passwords known to be compromised (using a service such as Have I Been Pwned's range API), and avoid simplistic complexity rules that lead to predictable passwords like "Summer2024!". Password reset flows must use single-use, time-limited tokens delivered through a verified channel, and must invalidate all of the user's existing sessions upon a successful reset.

### Secure sessions

Sessions must be identified by cryptographically random tokens of sufficient length (at least 128 bits of entropy), transmitted only over encrypted channels (HTTPS), and stored in a manner resistant to theft — for browser-based sessions, this means `HttpOnly`, `Secure`, and `SameSite` cookies. Session identifiers must never appear in URLs. Sessions must have a defined maximum lifetime, must expire after a period of inactivity, and must be revocable server-side (not merely expired client-side). When a user logs out, all of their sessions across all devices must be revocable from any device.

### Token management

When tokens are used for authentication (such as JWTs or opaque access tokens), they must be signed with a key of appropriate strength, must have a short lifetime (recommended 15 minutes or less for access tokens), and must be paired with a refresh token that can be revoked if the access token is compromised. Tokens must declare their issuer, audience, and expiration, and these claims must be validated on every request. Refresh token rotation should be used so that a stolen refresh token is detectable when it is used a second time. Token signing keys must be rotatable without downtime, and rotation must be a documented operational procedure, not a hypothetical emergency.

### Multi-factor authentication readiness

Every authentication surface must be designed to support MFA, even if MFA is not initially enforced for every user. MFA must be supported at minimum via TOTP (RFC 6238) authenticator apps, with a clear path to support hardware security keys (WebAuthn / FIDO2) for high-privilege accounts. Recovery flows for MFA must be designed with the same care as the primary authentication flow, because a weak MFA recovery flow is equivalent to having no MFA at all. Administrators of any tenant must be able to enforce MFA for their organization's members.

---

## 3. Authorization Rules

Authentication answers the question *"Who are you?"* Authorization answers the question *"What are you allowed to do?"* These are separate concerns and must be implemented as separate layers. A user who has correctly authenticated still has no rights beyond what authorization grants them.

### Roles

The platform must support a role-based access control (RBAC) model in which permissions are grouped into roles, and roles are assigned to users. Roles must be defined per tenant — the "manager" role in one business has no meaning in another business. Roles must be configurable: a tenant administrator must be able to define which permissions belong to each role, so that a restaurant can have a "head waiter" role with a different permission set than a clinic's "nurse" role. A small set of well-known roles (owner, administrator, member, viewer) may be seeded by default, but tenants must be able to customize them.

### Permissions

Permissions must be granular and must be expressed as the ability to perform a specific action on a specific resource — for example, `inventory.products.update` rather than a vague `edit` permission. Permissions must be checked on every operation that modifies or reveals data, not merely at the API entry point, because a single API call may cascade into multiple data accesses. Permission checks must be performed on the server, never trusted from the client. When a permission check fails, the system must deny access and log the attempt, but must not reveal to the caller whether the denied resource exists — such information leakage is a common vector for enumeration attacks.

### Tenant boundaries

The most important authorization rule in a multi-tenant system is that no user, regardless of their role, may ever access data belonging to a tenant they are not a member of. Tenant isolation must be enforced at the data layer, not merely at the application layer — every query must be scoped to the authenticated user's tenant by default, and explicit opt-in must be required to query across tenants (an operation that should be available only to platform-level administrators under tightly controlled circumstances). Every integration test suite must include tests that attempt cross-tenant access and verify that such access is denied. A failure of tenant isolation is the single most severe class of bug in the platform and must be treated as a release blocker.

---

## 4. Data Security Rules

Data security covers how sensitive information is protected at rest, in transit, and during processing. Each phase has distinct requirements.

### Encryption

All data must be encrypted in transit using TLS 1.2 or higher; older protocols must be disabled. Sensitive data at rest — including passwords (hashed, not encrypted), personal identification numbers, financial account numbers, and medical records — must be encrypted using strong, modern algorithms (AES-256-GCM or equivalent). Encryption keys must be managed through a dedicated key management service, must be rotated on a defined schedule, and must never be stored alongside the data they protect. Database-level encryption (transparent disk encryption) must be enabled in addition to application-level encryption for the most sensitive fields, so that a single layer failure does not expose data.

### Input validation

All input from users, API clients, and external systems must be treated as untrusted until proven otherwise. Input must be validated for type, length, format, and business-logic correctness before it is processed. Validation must use allow-lists (defining what is permitted) rather than deny-lists (defining what is forbidden), because allow-lists fail closed while deny-lists fail open. Output must be encoded appropriately for its destination context (HTML, JavaScript, SQL, URL, shell) to prevent injection attacks. Framework-provided validators and parameterized interfaces must be used in preference to hand-rolled validation, because hand-rolled validation is the source of most injection vulnerabilities.

### Secure APIs

APIs must enforce authentication on every endpoint, including those that appear to expose only public data, because unauthenticated endpoints are frequently abused for reconnaissance. APIs must enforce rate limiting to prevent brute-force and abuse, must validate input on every parameter, and must return only the data the caller is authorized to see — no over-fetching of fields that the caller does not need. Error responses must be generic to the caller and must not reveal internal stack traces, file paths, or database schema details, which are invaluable to attackers. APIs must use versioned paths to allow backwards-compatible security patches without breaking integrations.

### Safe database queries

Database queries must be constructed using parameterized statements or an ORM that supports parameterization. String concatenation of user input into queries is forbidden, regardless of perceived safety. Migrations must be reversible and must be reviewed for security implications, because a poorly designed migration can leak data across tenants or expose sensitive fields. Queries that span tenant boundaries must be explicitly tagged and reviewed, because they are the most likely source of cross-tenant data leakage.

### Secret management

Secrets — API keys, database credentials, signing keys, third-party tokens — must never appear in source code, configuration files committed to the repository, environment variable files (`.env`) that are committed, or log output. Secrets must be stored in a dedicated secret manager (such as HashiCorp Vault, AWS Secrets Manager, or the platform's native secrets facility) and must be injected into the application at runtime. The repository must include a `.gitignore` that excludes common secret file names, and a pre-commit hook should scan for accidentally committed secrets using tools such as `git-secrets` or `gitleaks`. When a secret is suspected to have been committed, it must be treated as compromised and rotated immediately, even if the commit is later removed from history.

---

## 5. Industry-Specific Security

Different industries handled by Business OS impose additional, legally and ethically mandatory security requirements. These are not optional refinements — they are baseline requirements that must be met before any module in that industry can be considered production-ready.

### Clinics — Medical privacy

Patient data is among the most heavily regulated categories of personal data in the world. Modules serving clinics must comply with applicable health data protection regulations, which typically require: explicit consent for data collection, purpose limitation (data collected for one purpose may not be reused for another), the right of patients to access and correct their own records, the right to deletion under specific circumstances, breach notification within tight timelines, and strict access logging (every read of a patient record must be logged with who, when, and why). Access to medical data must be on a strict need-to-know basis — a clinic's billing clerk does not need to see a patient's diagnoses, only the financial transactions.

### Schools — Student protection

Data about students, especially minors, requires particular care. Modules serving schools must implement: parental consent for data collection from minors, restrictions on what student data may be shared with third parties, protection against the disclosure of student records to unauthorized parties (including other students), and careful handling of sensitive categories such as disciplinary records, special education status, and health information collected by the school. Staff access to student records must be logged and must be limited to the students for whom the staff member is directly responsible.

### Businesses — Financial information

Retail shops, restaurants, and other commercial businesses handle financial data — payment card numbers, bank account details, supplier terms — that is subject to PCI DSS (for card data) and general financial regulations. Modules handling payment card data must either be fully PCI-compliant or, far more practically, must never touch raw card data at all — they must delegate payment processing to a compliant third-party payment provider and store only tokens. Invoices, supplier terms, and revenue figures are commercially sensitive and must be protected from access by other tenants and from unauthorized access within the same tenant.

### Churches — Member privacy

Church membership data is sensitive in ways that are sometimes overlooked. In some contexts, membership in a religious organization can expose individuals to social or even physical risk. Member directories, giving histories, prayer requests, and small-group participation records must be treated as confidential and must be accessible only to authorized roles within the church. Members must be able to control the visibility of their own information — for example, choosing whether their contact details appear in the member directory. Giving histories must be especially protected, because they reveal both financial capacity and religious commitment.

---

## 6. AI Security Rules

AI coding agents are now a routine part of the Business OS development workflow. They are powerful, fast, and productive — and they are also capable of introducing security vulnerabilities at a speed that human review struggles to match. The following rules apply to every code change produced with AI assistance, without exception.

### AI must never generate exposed API keys

AI-generated code must never contain hardcoded credentials, API keys, passwords, or signing secrets — not even as "placeholder" values, because placeholders are routinely forgotten and shipped to production. When an AI generates code that requires a secret, it must reference a secret manager or environment variable, and the AI must include in its output a clear note that the corresponding secret must be provisioned in the deployment environment. Any AI output that contains what appears to be a real credential must be treated as a security incident, even if the credential is later determined to be fictional, because the pattern of allowing credentials in code is itself the vulnerability.

### AI must never store passwords

AI-generated authentication code must never write passwords to logs, error messages, debug output, databases in plaintext, or any storage that is not the dedicated password hashing pipeline. When an AI generates a password-handling path, the reviewer must verify that the password passes directly from input to the hashing function and is never assigned to a variable whose name suggests it might be logged or persisted. The reviewer must also verify that password reset flows use single-use tokens and that those tokens are invalidated upon use.

### AI must never disable security checks

AI agents under time pressure sometimes propose disabling security checks — commenting out an authorization check, marking a test as skipped, disabling input validation "just for now," or granting overly broad permissions to make a feature work. This is forbidden. If a security check is failing, the correct response is to understand why and fix the underlying issue, not to silence the alarm. Any commit that disables a security check must include, in its commit message, the explicit reason and the conditions under which the check will be re-enabled — and the re-enabling must be tracked as an issue.

### AI must never ignore permissions

When an AI generates a new API endpoint, a new database query, or a new UI surface, it must include the corresponding permission checks as part of the same change — not as a follow-up. A PR that adds functionality without authorization checks is incomplete and must be rejected in review. AI must be prompted, at the start of every task, with the reminder that every data-access path requires an authorization check, and reviewers must verify that this requirement has been met.

### AI must never create insecure shortcuts

AI agents are prone to suggesting "quick" implementations that bypass established patterns: a direct database query that skips the tenant-scoping layer, an inline SQL string that "happens to be safe," a CORS configuration set to `*` to make local development work, a session check that accepts any user ID for testing. These shortcuts are the most common source of production security incidents, and they must be refused at review. When the established pattern is too slow or too rigid for the task, the correct response is to improve the pattern, not to bypass it.

---

## 7. Security Review Checklist

Before every major release — and before any minor release that touches authentication, authorization, data handling, or tenant isolation — the following checklist must be completed and recorded. The checklist is not a formality; each item must be actively verified, not assumed.

### Authentication checked

Verify that password hashing is in place for every new authentication path. Verify that session management follows the rules in section 2 — secure cookies, defined lifetimes, server-side revocation. Verify that MFA paths, if added, follow the recovery-flow rules. Verify that login rate limiting is in place and that failed attempts are logged and throttled.

### Permissions checked

For every new API endpoint, verify that authorization is enforced and that the permission check matches the sensitivity of the operation. For every new database query, verify that the query is scoped to the authenticated tenant. For every new UI surface, verify that the client does not render data the user is not authorized to see (and that the underlying API does not return it).

### Tenant isolation verified

Run the cross-tenant access test suite. Verify that a user authenticated as tenant A cannot read, write, or enumerate resources belonging to tenant B. Verify that this holds for direct API access, for indirect access through relationships (a resource owned by a user in tenant B), and for error-message timing (the response to "access denied" must be indistinguishable from "does not exist").

### Sensitive data protected

Review every new field added to a data model. For each, ask: is this sensitive? If yes, is it encrypted at rest? Is it redacted in logs? Is it excluded from API responses that do not strictly need it? Is it covered by the data retention policy? Is it included in the data export flow that allows users to exercise their data rights?

### Dependencies reviewed

Review the dependency manifest for new and updated packages. For each new dependency, verify that it is actively maintained, that it does not have known unpatched vulnerabilities, and that its license is compatible with the platform. For each updated dependency, review the changelog for breaking changes and security fixes. Run the dependency vulnerability scanner and verify that no high-severity issues remain unaddressed.

### Documentation updated

Security-relevant documentation must be updated as part of the release: the security section of affected component READMEs, the platform's security overview, the operational runbooks for incident response, and the data processing records that describe what data the platform holds and why. Documentation that is out of sync with the code is a security liability in itself, because responders rely on documentation during incidents when speed matters most.

---

## Enforcement

These rules are enforced through three mechanisms, in order of increasing severity:

1. **Code review** — every PR is reviewed against these rules by a human reviewer. AI-generated PRs receive an additional security-focused review pass.
2. **Automated checks** — where possible, rules are enforced by automated tooling: linters, secret scanners, dependency vulnerability scanners, and the cross-tenant isolation test suite.
3. **Security review** — major releases and any change touching authentication, authorization, data handling, or tenant isolation receive an additional review by someone with explicit security responsibility.

A failure to follow these rules is not a style preference — it is a defect. Defects must be fixed before merge, not deferred to a future ticket. When a rule must be relaxed for a legitimate reason, the relaxation must be documented in the PR, approved by a security reviewer, tracked as an issue, and time-boxed for remediation.
