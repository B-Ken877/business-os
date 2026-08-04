# Git Workflow

> Git is the source of truth for Business OS. This document defines how every change — human or AI — enters the repository, how it is reviewed, and how it is released.

These rules apply uniformly to human developers and to AI coding agents. The repository does not distinguish between the two; the same standards of traceability, reviewability, and reversibility apply to every commit.

---

## 1. Repository Philosophy

Git is not merely a backup mechanism or a way to share files between machines. It is the **source of truth** for the Business OS platform — the canonical record of what the system is, how it got there, and why. Every other artifact (deployed environments, documentation sites, package registries) is a derivative of what lives in Git, and any artifact that cannot be traced back to a specific commit is suspect by definition.

Because Git is the source of truth, every change made to the platform must satisfy three properties:

- **Traceable** — It must always be possible to answer the questions *who made this change, when, why, and under what review*. This means every commit carries an author, a timestamp, a message that explains intent, and a link (direct or referenced) to the issue, requirement, or decision that motivated it. Anonymous, undated, or unexplained commits are not acceptable.
- **Reviewable** — No change reaches `main` without passing through a pull request in which another contributor (human, in the case of AI-authored code) has read the diff, asked questions where needed, and explicitly approved. "Reviewable" also means the diff must be small and focused enough that a reviewer can actually hold it in their head — giant omnibus PRs that touch dozens of unrelated files defeat review even if they technically go through the process.
- **Reversible** — Because every change is a discrete commit on a linear, reviewable history, any change that turns out to be wrong can be reverted without collateral damage. This requires that commits be coherent units of work: a commit that does five unrelated things cannot be reverted without also reverting four things that may have been correct.

These three properties are not aspirational. They are enforced by the branch strategy, the commit standards, and the pull request requirements defined in the rest of this document. Any workflow that violates them — even if it is faster in the short term — is out of compliance with this constitution.

---

## 2. Branch Strategy

Business OS uses a simple, well-understood branch model: a single long-lived integration branch (`main`) that always reflects the last known-good state of the platform, plus many short-lived topic branches that deliver specific changes into `main` through pull requests. We deliberately avoid complex branching models (Git Flow, release branches per environment, etc.) until the platform's scale demands them; premature process is itself a form of technical debt.

### `main`

`main` is the production-ready, stable trunk of the repository. The code on `main` must always be in a state that could, in principle, be deployed to serve real businesses. This does not mean `main` is always perfect — bugs will exist — but it means `main` must never contain known-broken code, half-finished features hidden behind flags that do not work, or work that has not been reviewed.

Rules for `main`:

- Commits land on `main` only through merged pull requests. Direct pushes to `main` are not permitted, including for "trivial" or "emergency" changes — emergencies are handled through fast-tracked PRs, not bypasses.
- `main` must build and pass its test suite at every commit. If a commit breaks `main`, reverting it takes priority over fixing it forward.
- `main` history is linear and readable. We use squash or rebase merges to keep the per-PR history clean; merge commits that pile up unrelated intermediate states are avoided.
- Force-pushing to `main` is forbidden. History on `main` is immutable once published.

### Feature branches

Format: `feature/<component-name>`

Used for adding new capabilities — a new reusable component, a new core module, a new template, a significant new feature inside an existing module. The component name should match the naming conventions defined in `component-standard.md` (kebab-case, descriptive of the business capability, not the author or the date).

Examples:

- `feature/inventory-management` — building the inventory component for retail.
- `feature/appointment-system` — building the appointment component for clinics.
- `feature/multi-tenant-audit-log` — extending core's audit log to be tenant-scoped.

### Bug fix branches

Format: `fix/<problem-name>`

Used for correcting defects in existing code. The problem name should describe the symptom or the affected area, not the fix (the fix is what the PR is for). A good branch name lets a reviewer understand the scope of the fix before opening the diff.

Examples:

- `fix/tuition-payment-double-counting` — a tuition payment was being recorded twice under certain conditions.
- `fix/menu-item-ordering-after-midnight` — menu items were displayed in the wrong order across day boundaries.

### Documentation branches

Format: `docs/<document-name>`

Used for changes that only touch documentation — README files, the `ai-instructions/` constitution, the `documentation/` directory, component README files. Documentation changes deserve their own branch type because they should never be blocked by code review concerns, and they should never be mixed into code changes (which would force reviewers to read both when they only care about one).

Examples:

- `docs/architecture-rules-revision` — updating this constitution.
- `docs/inventory-component-readme` — writing or updating the README for the inventory component.

### Branch hygiene

- One concern per branch. A branch that started as `feature/inventory-management` but has grown to also touch authentication should be split into two PRs.
- Delete branches after merge. Stale branches accumulate and obscure which work is actually active.
- Rebase against `main` before opening a PR, so the diff the reviewer sees is the diff that will actually merge.

---

## 3. Commit Standards

Business OS uses **Conventional Commits** as its commit message standard. Conventional Commits is a lightweight specification that prefixes every commit with a type (and optionally a scope), enabling both human readers and automated tooling to quickly understand what a commit does and to generate changelogs automatically.

The format is:

```
<type>(<optional scope>): <imperative summary>

<optional body explaining why, not what>

<optional footer referencing issues or breaking changes>
```

### Commit types

- **`feat`** — New functionality visible to users of the platform (a business, a developer using a component, an AI agent composing a system). A new component, a new endpoint, a new configuration option, a new template — all are `feat`.
- **`fix`** — Correction of a bug in existing functionality. The bug must have been observable behavior; "fix" does not cover typos in documentation (use `docs`) or stylistic refactors (use `refactor`).
- **`docs`** — Changes to documentation only: README files, the engineering constitution, component docs, code comments that are user-facing. Pure documentation changes have no runtime effect.
- **`refactor`** — Improvement to code structure without changing observable behavior. Renaming a function for clarity, extracting a duplicate block into a shared helper, simplifying a conditional — all `refactor`. A refactor that also fixes a bug is two commits.
- **`test`** — Changes that add or modify tests, with no production-code changes. If a PR adds both a feature and its tests, that is a single `feat` commit (tests are expected to accompany features, not be separate commits).
- **`security`** — Changes whose primary purpose is improving security: hardening an authentication flow, patching a vulnerable dependency, fixing an authorization bypass. Security commits should explicitly note what was vulnerable and what was hardened in the body.

### Examples

```
feat(inventory): add stock-adjustment endpoint with audit trail

Adds `POST /inventory/adjustments` to allow staff to record
manual stock changes (shrinkage, damages, transfers). Each
adjustment writes to the audit log with the acting user,
reason, and previous/after quantities.

Resolves: BUSINESS-OS-142
```

```
fix(tuition): prevent duplicate tuition records on payment retry

When a payment provider retried a webhook after a network
timeout, the receiver created a second tuition record instead
of idempotently ignoring the retry. Now keyed on the provider's
transaction id.

Resolves: BUSINESS-OS-203
```

```
docs(ai-instructions): clarify AI component creation rules

Adds an explicit "Why existing components cannot solve the
problem" requirement to the AI component creation section,
following an incident where an AI agent created a duplicate
inventory component instead of extending the existing one.
```

```
security(clinics): enforce tenant boundary on patient record reads

Patient record reads were not validating that the requesting
user belonged to the same tenant as the patient. Adds an
explicit tenant check at the authorization layer, enforced
on every read path.
```

### Rules

- The summary line is in the **imperative mood** ("add", not "added" or "adds") — as if giving a command. This matches how Git itself describes commits ("Merge branch X").
- The summary is at most 72 characters. The body wraps at 100 characters. These limits are not arbitrary — they keep `git log` readable in a terminal.
- Every commit message answers *why* the change was made, not just *what* changed — the diff already shows the *what*.
- Atomic commits: each commit is one logical change. A PR may contain several commits, each focused; reviewers can read them in order.

---

## 4. Pull Request Requirements

A pull request is the unit of review on Business OS. It is the boundary at which a change is validated, discussed, and either accepted into `main` or rejected. Because the PR is the gate, the quality of the PR description directly determines the quality of the review — a PR with no description forces the reviewer to reverse-engineer intent from the diff, which is slow and error-prone.

Every pull request must include the following sections, in this order, in the PR description:

### Description

A short (3–6 sentence) summary of what the PR does, written for a reviewer who understands the platform but has not been following the branch. The description should answer: what problem is being solved, what is the approach, and what is the user-visible effect (if any). It should not duplicate the commit message verbatim, but should provide enough context that a reviewer can decide whether to read the diff.

### Reason for change

Why this change is being made *now*. Is it fixing a reported bug? Implementing a planned feature? Hardening a security issue discovered in review? A reviewer needs to understand the motivation to evaluate whether the chosen solution is appropriate — sometimes the right answer to a PR is "this is a real problem, but the fix should be done at a different layer", and that judgment requires knowing the reason.

### Files changed

A high-level inventory of what was modified, organized by concern, not by alphabetical file order. For example: "Database: new migration adding `adjustments` table. Backend: new endpoint and authorization check. Frontend: new form for staff. Tests: coverage for the new endpoint." This helps a reviewer navigate a large diff and gives them a checklist to verify nothing is missing.

### Testing performed

Exactly what the author did to verify the change works. This includes: automated tests added or run, manual testing performed (with concrete steps a reviewer could reproduce), and any testing that was *not* done and why. "Not tested" is acceptable information for a reviewer to have; "tested" without specifics is not.

### Security considerations

An explicit statement of the security implications of the change. Does it touch authentication, authorization, or tenant boundaries? Does it handle sensitive data? Does it introduce a new entry point (API, file upload, external input)? If yes, what mitigations are in place? If no, the author states "No security implications — change is purely X" so the reviewer knows the question was considered, not forgotten.

### Documentation updates

What documentation was updated to reflect the change — component READMEs, the engineering constitution, API docs, configuration references. A change that adds a feature but does not update documentation is incomplete by definition (see the Documentation principle in `architecture-rules.md`).

### Additional PR rules

- PRs are small. If a PR exceeds roughly 400 lines of diff (excluding generated files and lock files), it should be split unless there is a compelling reason it cannot be.
- Every PR is reviewed by at least one human contributor other than the author. AI-authored PRs are reviewed by a human who understands the area being changed.
- A PR that touches security-sensitive code (authentication, authorization, tenant isolation, payment handling, medical or student data) requires review by a contributor designated as a security reviewer for that area.
- Approvals expire after 7 days of inactivity. If `main` has moved significantly since the PR was approved, the PR must be re-reviewed.

---

## 5. AI Generated Code Workflow

AI coding agents are first-class contributors to Business OS, and the platform is explicitly designed to be assembled with their help. But AI-generated code carries specific risks that human-authored code does not: AI is more likely to invent patterns that look plausible but do not match the platform's conventions, to silently introduce dependencies that were not requested, and to produce code that "works" in the happy path but fails on edge cases the AI did not consider. For these reasons, AI-generated code is held to *stricter* review standards than human-authored code, not laxer ones.

AI generated code must:

- **Never be blindly accepted.** Every AI-authored PR is treated as a draft that a human reviewer must read line by line before approving. The reviewer's job is not to rubber-stamp; it is to verify the AI's work against the platform's standards, conventions, and security requirements. A reviewer who approves AI code they did not actually read has failed the review.
- **Be reviewed for architecture fit, not just correctness.** Correctness ("does it work?") is necessary but not sufficient. The reviewer must also ask: does this fit into the four-layer architecture? Should this be a reusable component instead of business-specific code? Does it duplicate something that already exists? Does it follow the naming conventions in `component-standard.md`? AI agents frequently produce correct code in the wrong place; reviewers must catch this.
- **Follow architecture rules.** AI-generated code must obey `architecture-rules.md` exactly: no industry-specific logic in `core/`, no customer-specific logic in `reusable-components/`, no duplicate modules. If an AI agent produces code that would violate these rules, the correct response is not to merge it and "fix it later" — it is to redirect the AI to the right layer and have it produce the code in the correct location.
- **Include tests where needed.** AI agents are capable of writing tests and should be directed to do so for any non-trivial logic. Tests must cover at least the happy path and the most important failure paths. Tests that the AI writes must themselves be reviewed — AI-written tests sometimes assert the wrong thing and pass for the wrong reason.
- **Include documentation.** AI agents must update or create the relevant documentation as part of the same PR: component READMEs, API docs, configuration references. A PR that adds code but no documentation is incomplete and should not be merged.

When an AI agent is asked to make a change and the right answer is "this already exists" or "this should not be built", the AI is expected to say so rather than producing the requested code anyway. The AI's job is not to fulfill every request literally; it is to help build the platform correctly.

---

## 6. Repository Hygiene

The state of the repository is a leading indicator of the state of the platform. A repository that accumulates cruft — unused files, dead dependencies, committed secrets, temporary code that was never cleaned up — produces a platform that accumulates the same problems at a larger scale. Hygiene is therefore enforced at the level of the repository, not just at the level of individual features.

Rules:

- **No unnecessary files.** Every file in the repository must justify its presence. Files that were created for a one-time purpose and are no longer referenced (scripts for a completed migration, draft documents, experimental prototypes) must be removed once their purpose is served. The repository is not a personal archive.
- **No secrets.** Passwords, API keys, tokens, private certificates, and connection strings with credentials must never be committed to the repository, including in test fixtures, example configurations, or comments. Secrets are injected at runtime through environment variables or a secrets manager; the repository contains only the *names* of the secrets it expects, never their *values*. Any accidental commit of a secret is treated as an incident: the secret is rotated immediately and the commit is removed from history.
- **No temporary code.** "Temporary" code (workarounds, "TODO: fix this later", quick fixes that "we'll come back to") accumulates faster than it is cleaned up and is one of the most reliable predictors of long-term maintenance pain. If a workaround is genuinely necessary, it is committed with an explicit, tracked issue referenced in the commit message and a clear comment explaining why the workaround exists and what the proper fix would look like. Vague "TODO" comments with no owner and no plan are not acceptable.
- **No unused dependencies.** Dependencies that were added for a feature that was later removed, or for a prototype that did not ship, must be removed. Unused dependencies are not just bloat — they expand the attack surface (every dependency is potential supply-chain risk), slow down installs, and confuse future contributors who assume the dependency is being used somewhere. Periodic audits of dependencies against actual imports are part of routine maintenance.

### `.gitignore` discipline

The repository maintains a `.gitignore` that excludes, at minimum: editor configuration directories, build artifacts, dependency install directories, log files, local environment files (`.env`, `*.local`), and OS-specific junk files (`.DS_Store`, `Thumbs.db`). Anything machine-specific or user-specific does not belong in version control.

### Large files

Large binary assets (images, videos, compiled binaries, database dumps) are not committed directly to Git. They are stored in an external asset system (object storage, package registry, or Git LFS if the platform adopts it) and referenced by URL or version from the repository. Committing large binaries into Git bloats the repository history irreversibly — even if the file is later removed, it remains in the history, slowing every clone forever.

---

## Enforcement

These rules are enforced through three mechanisms working together:

1. **Branch protection on `main`.** Direct pushes are rejected; PRs require at least one approval; CI must pass before merge is possible. This is configured at the repository level and is not subject to individual override.
2. **Pull request templates.** The PR template enforces the six required sections (description, reason, files changed, testing, security, documentation updates) by pre-filling them in every new PR. An author who deletes a section is signaling that they have not done the corresponding work.
3. **Reviewer judgment.** No amount of automation can replace a reviewer who understands the platform and applies these rules thoughtfully. The rules above are the floor, not the ceiling — a reviewer may always ask for more rigor when the change warrants it.

When a rule needs to be broken (and there will be legitimate cases), the break is documented explicitly in the PR description, with the rule being broken, the reason, and the mitigation. Undocumented exceptions erode the rules; documented exceptions are how the rules evolve.
