# ITM@15 — PROJECT AUDIT, COMPLETION & PENDING WORK CONTROL

## Purpose

This file is the **mandatory project audit and completion-control instruction** for Claude Code working on the `Gichangi001/ITM-15` repository.

Its purpose is to ensure Claude always knows what has already been built, what is partially built, what is missing, what is blocked, what is broken, what has been tested, what still needs testing, and what does not yet align with the Product Guide, WALLY specification, Master Build Runbook, security requirements, architecture decisions, or current project state.

This file must be used continuously during the build.

It is **not enough for code to exist**.

A feature may only be marked complete when it has been implemented, inspected, tested, validated against requirements, security checked where relevant, verified in the actual user flow, documented, reflected in project state and memory, and confirmed not to break existing functionality.

A checkbox marked `[x]` is therefore a **verified completion state**, not a statement that code was merely written.

---

# 1. MANDATORY SOURCE FILES

Before performing any audit, read and reconcile the latest versions of:

```text
CLAUDE.md
ITM15_MASTER_BUILD_RUNBOOK.md
docs/PRODUCT_GUIDE.md
docs/WALLY.md
docs/PROJECT_STATE.md
docs/QUALITY_STATUS.md
docs/DOCS_INDEX.md
docs/claude/ENVIRONMENT_INVENTORY.md
```

Also inspect, where present:

```text
docs/decisions/
docs/architecture/
docs/logs/
.claude/skills/
.claude/agents/
.mcp.json
supabase/
tests/
.github/workflows/
package.json
README.md
```

Search the repository for all:

```text
*.md
*.doc
*.docx
*.pdf
*.txt
```

and include any product, design, architecture, security, QA, deployment, or implementation documents that materially affect requirements.

Do not audit the project from memory alone.

The repository and its authoritative documents are the source of truth.

---

# 2. READ PROJECT MEMORY AND LOGS

Before determining what is complete, inspect all project memory/state mechanisms available.

At minimum review:

```text
docs/PROJECT_STATE.md
docs/QUALITY_STATUS.md
docs/logs/
git log
git status
recent commits
recent pull requests
test reports
build output
deployment status
```

Where available also inspect:

```text
/memory
MCP memory / knowledge graph
Claude auto-memory
project ADRs
GitHub Actions
Vercel deployment logs
Supabase migration history
Sentry issues
Playwright reports
coverage reports
```

Memory and logs are supporting evidence.

They do **not** override the actual repository implementation or test results.

If memory says something is complete but the feature is missing or tests fail, mark it incomplete.

---

# 3. CREATE OR UPDATE THE MASTER AUDIT FILE

Maintain this file:

```text
docs/PROJECT_AUDIT_CHECKLIST.md
```

This file is the authoritative operational checklist of:

- Completed
- In Progress
- Pending
- Blocked
- Failed Verification
- Deferred

Never maintain separate competing completion lists.

Other documents may summarize progress, but `docs/PROJECT_AUDIT_CHECKLIST.md` is the detailed verification checklist.

---

# 4. ALLOWED STATUS MARKERS

Use these exact states.

## Verified Complete

```markdown
- [x] Feature name
```

Use `[x]` **only** when all completion gates pass.

## Pending

```markdown
- [ ] Feature name
```

Use when work has not been completed or verification has not yet happened.

## In Progress

```markdown
- [ ] Feature name — STATUS: IN PROGRESS
```

Do not mark partially implemented work as complete.

## Blocked

```markdown
- [ ] Feature name — STATUS: BLOCKED
```

Then record:

```text
Blocker:
Impact:
Required resolution:
Owner/dependency:
```

## Failed Verification

```markdown
- [ ] Feature name — STATUS: FAILED VERIFICATION
```

This means code exists but one or more completion gates failed.

## Deferred

```markdown
- [ ] Feature name — STATUS: DEFERRED
```

A deferred item still remains pending unless a documented product decision removes it from scope.

---

# 5. DEFINITION OF DONE

Claude may mark an item `[x]` only when **all applicable gates below pass**.

## Gate A — Requirement Exists and Is Understood

Confirm the feature against one or more authoritative sources:

```text
Product Guide
WALLY.md
Master Build Runbook
ADR
Architecture documentation
Security requirement
Explicit approved project decision
```

Record the requirement reference.

## Gate B — Implementation Exists

Verify the implementation is actually present and inspect the relevant code paths. Do not rely only on commit messages.

## Gate C — Static Quality Checks Pass

Run all applicable checks:

```bash
lint
typecheck
production build
```

No feature is complete if it introduces lint, type, or build failures.

## Gate D — Unit / Integration Tests Pass

Run tests appropriate to the feature, including where relevant:

```text
Unit tests
API tests
Database tests
RLS tests
Scoring tests
Voting tests
Upload tests
Scheduler tests
Notification tests
```

Record the exact test or suite that validates it.

## Gate E — End-to-End User Flow Passes

For user-facing functionality, validate the real flow using Playwright or equivalent. Do not only test isolated components.

## Gate F — Realtime Verification Passes

For realtime functionality verify:

```text
Connected clients update without refresh.
Correct audience receives event.
Unauthorized audience does not receive event.
Reconnect behavior is acceptable.
Duplicate events do not corrupt state.
```

Applicable to Wally events, score updates, voting, Mission Control, theme changes, live notifications, challenge launches, country activity, and spectator mode.

## Gate G — Security Verification Passes

For sensitive functionality inspect authentication, authorization, RLS, server-side validation, input validation, secret handling, file upload controls, rate limiting where required, privilege escalation, voting abuse, score manipulation, IDOR, unauthorized admin access, route protection, service-role exposure, and audit logging.

If a security-relevant feature has not been security checked, it stays `[ ]`.

## Gate H — UX / Visual Verification Passes

For visible features verify responsive desktop, responsive mobile, loading state, empty state, error state, success state, accessibility, readable contrast, keyboard/focus behavior where applicable, reduced-motion behavior, and correct Wally behavior where relevant.

## Gate I — Requirement Alignment Passes

Explicitly compare the built behavior to the source requirement.

Ask:

```text
Did we build the requested feature?
Did we simplify it?
Did we omit any requirement?
Did the implementation change the intended experience?
Is there hidden technical debt that prevents the requirement from truly being complete?
```

A technically functional feature that does not match the product requirement remains `[ ]`.

## Gate J — Regression Check Passes

Run the relevant regression suite and confirm that completing this feature did not break authentication, admin, game state, scoring, voting, photos, realtime, Wally, routing, mobile, or production build.

## Gate K — Documentation and Memory Updated

Before marking `[x]`, update where applicable:

```text
docs/PROJECT_STATE.md
docs/QUALITY_STATUS.md
docs/PROJECT_AUDIT_CHECKLIST.md
docs/DOCS_INDEX.md
ADR
architecture docs
project memory / knowledge graph
```

Document important new relationships or decisions.

---

# 6. REQUIRED COMPLETION EVIDENCE

Every `[x]` item must have an evidence block.

Use this format:

```markdown
- [x] Employee first-login password reset

  **Requirement:** Product Guide / Authentication
  **Implementation:** `app/...`, `lib/...`
  **Tests:** `tests/e2e/auth-first-login.spec.ts`
  **Security:** RLS + server-side session check verified
  **Result:** PASS
  **Verified:** YYYY-MM-DD
  **Commit:** `<sha>`
```

For a major subsystem also include:

```text
Preview deployment:
Screenshot/report:
Known limitations:
```

If evidence cannot be provided, the checkbox must remain `[ ]`.

---

# 7. AUDIT PROCEDURE

Every time Claude is asked to `continue`, `audit`, `check progress`, `what is pending`, `resume build`, `finish project`, or `prepare release`, perform this sequence first.

## STEP 1 — Repository State

Run:

```bash
git status
git branch --show-current
git log --oneline -20
```

Inspect uncommitted changes.

## STEP 2 — Read Project State

Read:

```text
CLAUDE.md
ITM15_MASTER_BUILD_RUNBOOK.md
docs/PRODUCT_GUIDE.md
docs/WALLY.md
docs/PROJECT_STATE.md
docs/QUALITY_STATUS.md
docs/PROJECT_AUDIT_CHECKLIST.md
```

## STEP 3 — Read Memory

Inspect available project memory / knowledge graph and compare remembered state to actual code. Never assume memory is correct.

## STEP 4 — Inspect Recent Work

Inspect recent commits, changed files, PRs, migrations, tests, deployments, and logs.

## STEP 5 — Requirement Inventory

Build or refresh a complete requirement inventory from the Product Guide, WALLY.md, and Master Build Runbook.

Every material requirement must appear in the audit checklist.

Nothing may disappear simply because it has not yet been implemented.

## STEP 6 — Compare Requirements Against Implementation

For every requirement assign one of:

```text
VERIFIED COMPLETE
IN PROGRESS
PENDING
BLOCKED
FAILED VERIFICATION
DEFERRED
```

## STEP 7 — Verify Existing `[x]` Items

Do not blindly trust previous checkboxes.

Where code materially changed, rerun relevant verification.

If a previously completed feature is now broken:

```markdown
- [ ] Feature — STATUS: FAILED VERIFICATION
```

Record why it was reopened.

## STEP 8 — Run Core Health Checks

At minimum run the repository's configured equivalents of:

```bash
lint
typecheck
test
build
```

Also run targeted suites needed to validate changed areas.

## STEP 9 — Refresh Pending Work

Generate a clear pending list grouped by:

```text
Critical blockers
Security
Foundation
Authentication
Database
Admin Mission Control
Game Engine
Realtime
Wally
Voting
Photos / Media
Scoring
Leaderboards
Notifications / Email
Themes
Analytics
Accessibility
Performance
Testing
Deployment
Documentation
```

## STEP 10 — Determine Next Work

Select the next work item using this priority:

1. broken production-critical behavior;
2. security failures;
3. foundational blockers;
4. failed tests;
5. incomplete dependencies;
6. current build phase;
7. user-facing polish;
8. optional enhancements.

Never prioritize animation polish ahead of broken authentication or authorization.

---

# 8. REQUIRED MASTER CHECKLIST STRUCTURE

`docs/PROJECT_AUDIT_CHECKLIST.md` should use this structure.

```markdown
# ITM@15 Project Audit Checklist

Last audit:
Branch:
Commit:
Environment:
Current build phase:

## Executive Status

Total requirements:
Verified complete:
In progress:
Pending:
Blocked:
Failed verification:
Deferred:

Overall completion:
Release readiness:

## Critical Blockers
- [ ] ...

## Foundation & Repository
- [ ] ...

## Tooling & Claude Environment
- [ ] ...

## Documentation
- [ ] ...

## Authentication & User Management
- [ ] ...

## Employee Onboarding
- [ ] ...

## Database & RLS
- [ ] ...

## Admin Mission Control
- [ ] ...

## Game Engine
- [ ] ...

## Missions & Challenges
- [ ] ...

## Scoring & Unity Points
- [ ] ...

## Voting
- [ ] ...

## Photos & Media
- [ ] ...

## Realtime
- [ ] ...

## Wally
- [ ] ...

## Seven-Day Story
- [ ] ...

## Country & Squad Features
- [ ] ...

## Passport & Achievements
- [ ] ...

## Leaderboards
- [ ] ...

## Notifications
- [ ] ...

## Daily Wally Email
- [ ] ...

## Theme Engine
- [ ] ...

## Spectator / Event Screen
- [ ] ...

## Analytics
- [ ] ...

## Accessibility
- [ ] ...

## Performance
- [ ] ...

## Security
- [ ] ...

## Unit Tests
- [ ] ...

## Integration Tests
- [ ] ...

## E2E Tests
- [ ] ...

## Realtime Tests
- [ ] ...

## Visual QA
- [ ] ...

## Production Build
- [ ] ...

## Vercel Preview
- [ ] ...

## Production Readiness
- [ ] ...

## Documentation & Memory
- [ ] ...

## Deferred Items
- [ ] ...
```

---

# 9. REQUIREMENT TRACEABILITY MATRIX

Maintain a traceability table inside the audit document for all major requirements.

| ID | Requirement | Source | Implementation | Tests | Security | Status |
|---|---|---|---|---|---|---|
| AUTH-001 | Employee email login | Product Guide | `...` | `...` | PASS | VERIFIED |
| AUTH-002 | Forced password change | Product Guide | `...` | `...` | PASS | VERIFIED |
| WAL-001 | Wally personalized greeting | WALLY.md | `...` | `...` | N/A | PENDING |
| ADM-001 | Live connected-user monitoring | Product Guide | `...` | `...` | PASS | IN PROGRESS |

Use stable IDs.

Recommended prefixes:

```text
DOC
ENV
AUTH
USR
DB
RLS
ADM
GAME
MIS
SCORE
VOTE
MEDIA
RT
WAL
STORY
COUNTRY
SQUAD
PASS
ACH
LB
NOTIF
EMAIL
THEME
SCREEN
AN
A11Y
PERF
SEC
TEST
DEPLOY
```

Never delete an ID merely because the feature is not currently planned.

If scope changes, mark it `DEFERRED` or create an ADR explaining removal.

---

# 10. TEST MATRIX

For every major feature maintain required test coverage.

| Feature | Unit | Integration | E2E | Security | Realtime | Visual | Status |
|---|---|---|---|---|---|---|---|
| Login | ✅ | ✅ | ✅ | ✅ | N/A | ✅ | VERIFIED |
| Voting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | VERIFIED |
| Wally Drop | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | VERIFIED |
| Photo Approval | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | VERIFIED |

A feature should not be `[x]` if required test columns remain unverified.

---

# 11. SECURITY CHECKLIST

Maintain a separate security block.

```markdown
## Security

- [ ] Employee cannot access admin routes
- [ ] Country Admin cannot control another country
- [ ] Moderator cannot award unauthorized points
- [ ] Browser cannot directly manipulate score ledger
- [ ] Duplicate votes rejected server side
- [ ] RLS enforced on player data
- [ ] RLS enforced on media
- [ ] Service-role key absent from client bundle
- [ ] Upload MIME and size validation enforced
- [ ] Signed/private media access verified
- [ ] Rate limiting applied where needed
- [ ] Admin actions audit logged
- [ ] Wally admin targeting authorization verified
- [ ] Realtime channels protected
- [ ] Secrets excluded from Git
- [ ] Secrets excluded from Claude memory
- [ ] Secrets excluded from knowledge graph
```

These become `[x]` only after explicit verification.

---

# 12. WALLY VERIFICATION CHECKLIST

```markdown
## Wally

- [ ] Wally architecture matches WALLY.md
- [ ] Wally does not own authoritative score logic
- [ ] Personalized name greeting works
- [ ] Mission introduction works
- [ ] Correct-answer reaction works
- [ ] Wrong-answer reaction works
- [ ] Achievement reaction works
- [ ] Photo approval reaction works
- [ ] Bonus-point reaction works
- [ ] Country-overtake reaction works
- [ ] Wally Drop works in realtime
- [ ] Targeted player message works
- [ ] Country-targeted message works
- [ ] Squad-targeted message works
- [ ] Global message works
- [ ] Wally admin preview works
- [ ] Wally animation states work
- [ ] Wally does not interrupt critical form actions
- [ ] Reduced-motion mode works
- [ ] Lite/2D fallback works
- [ ] Mobile performance acceptable
- [ ] Seven-day Wally progression works
- [ ] I-B-E-L-O-N-G sequence implemented
- [ ] Wally analytics events captured
```

---

# 13. ADMIN MISSION CONTROL VERIFICATION

```markdown
## Admin Mission Control

- [ ] Admin authentication works
- [ ] Role authorization works
- [ ] Live player count works
- [ ] Country activity works
- [ ] Squad activity works
- [ ] Mission creation works
- [ ] Mission editing works
- [ ] Mission scheduling works
- [ ] Challenge launch works
- [ ] Surprise challenge works
- [ ] Question editing works
- [ ] Voting controls work
- [ ] Photo moderation works
- [ ] Bonus points work
- [ ] Point deductions follow authorization rules
- [ ] Theme change works
- [ ] Chapter lock/unlock works
- [ ] Wally Control Room works
- [ ] Audience targeting works
- [ ] Live notifications work
- [ ] Featured media works
- [ ] Spectator screen controls work
- [ ] Audit log works
- [ ] Emergency pause works
```

---

# 14. AUTHENTICATION VERIFICATION

```markdown
## Authentication & Users

- [ ] Admin can create employee account
- [ ] Email stored correctly
- [ ] Name stored correctly
- [ ] Country stored correctly
- [ ] Entity stored correctly
- [ ] Temporary password flow works
- [ ] `Walumo` cannot remain permanent password
- [ ] Forced password reset works
- [ ] Private password stored through Auth provider
- [ ] Session persists correctly
- [ ] Logout works
- [ ] Unauthorized route protection works
- [ ] Admin route protection works
- [ ] User role is server verified
```

---

# 15. GAME LOOP VERIFICATION

Before describing the project as playable, this complete loop must be `[x]`.

```markdown
## Day Zero Vertical Slice

- [ ] Admin creates cross-country challenge
- [ ] Challenge publishes successfully
- [ ] Connected player receives it without refresh
- [ ] Wally introduces the challenge
- [ ] Player sees correct requirement
- [ ] Player submits required response
- [ ] Photo uploads successfully
- [ ] Moderator receives submission
- [ ] Moderator approves submission
- [ ] Server awards Unity Points
- [ ] Score ledger records event
- [ ] Leaderboard updates
- [ ] Wally congratulates player
- [ ] Passport stamp unlocks
- [ ] Admin sees updated activity
- [ ] Audit log records admin action
- [ ] E2E test passes
```

Until this loop passes, do not describe the core game as complete.

---

# 16. DAILY EMAIL VERIFICATION

```markdown
## Wally Email

- [ ] Employee is enrolled after admin account creation
- [ ] Reminder schedule configured
- [ ] Correct timezone used
- [ ] Email includes player's name
- [ ] Email includes Wally personality
- [ ] Email includes current day's hook
- [ ] Email includes game link
- [ ] Link reaches correct environment
- [ ] Completed users are handled correctly
- [ ] Disabled users do not receive reminders
- [ ] Send failures logged
- [ ] Retry behavior documented
```

---

# 17. RELEASE READINESS RULE

Claude must not report `READY FOR PRODUCTION` until every release-blocking checklist item is `[x]`.

```markdown
# Release Gate

- [ ] All critical requirements verified
- [ ] No unresolved critical blockers
- [ ] No critical security findings
- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E critical flows pass
- [ ] Realtime tests pass
- [ ] Production build passes
- [ ] Mobile QA passes
- [ ] Accessibility critical checks pass
- [ ] Vercel Preview verified
- [ ] Supabase migrations verified
- [ ] RLS verified
- [ ] Environment variables verified
- [ ] Rollback procedure verified
- [ ] Project state updated
- [ ] Quality status updated
- [ ] Knowledge graph updated
- [ ] Release commit identified
```

Only when all applicable release blockers are `[x]` may release readiness become `READY`.

---

# 18. AUDIT OUTPUT REQUIRED FROM CLAUDE

After every full audit, Claude must return a concise report in this structure:

```text
ITM@15 AUDIT RESULT

Current Phase:
Current Branch:
Current Commit:

Verified Complete:
X / Y

In Progress:
X

Pending:
X

Blocked:
X

Failed Verification:
X

Critical Issues:
...

Tests:
Lint:
Typecheck:
Unit:
Integration:
E2E:
Build:
Security:
Realtime:

Next Required Work:
1.
2.
3.

Files Updated:
...

Audit Checklist Updated:
YES / NO

Project State Updated:
YES / NO

Memory / Knowledge Graph Updated:
YES / NO
```

Do not say simply `Everything looks good.`

Provide measurable state.

---

# 19. AUTO-REOPEN RULE

If a completed feature later fails a test, build, security review, requirement alignment check, regression, or production verification, automatically reopen it.

Change:

```markdown
- [x] Feature
```

to:

```markdown
- [ ] Feature — STATUS: FAILED VERIFICATION
```

Record:

```text
Previously verified:
Failure discovered:
Cause:
Required fix:
```

No checkbox is permanently trusted.

---

# 20. NO FALSE COMPLETION

Never mark `[x]` because files were created, code compiles locally, a developer says it works, a commit exists, UI looks correct, one happy-path manual test worked, memory says it was done, or Claude previously claimed it was complete.

Completion requires evidence.

---

# 21. NEXT-ACTION ENGINE

After every audit, derive the next safe task automatically.

Use:

```text
Blockers
↓
Security
↓
Broken tests
↓
Foundation
↓
Dependencies
↓
Current phase requirements
↓
UX and engagement
↓
Polish
```

Select a small enough unit that it can be implemented, tested, verified, documented, and committed before moving to the next item.

---

# 22. PERIODIC FULL RE-AUDIT

Perform a complete requirement re-audit:

- after every major build phase;
- before every release candidate;
- after major architecture changes;
- after security changes;
- after authentication changes;
- after database/RLS changes;
- before production;
- whenever project state and repository reality appear inconsistent.

The goal is to prevent requirements from disappearing during development.

---

# 23. MASTER INSTRUCTION TO CLAUDE

Whenever this project is resumed, follow this rule:

> First determine reality.
>
> Read the requirements.
>
> Read the project state.
>
> Read the logs.
>
> Read memory.
>
> Inspect the code.
>
> Run the tests.
>
> Compare implementation to requirements.
>
> Update the audit checklist.
>
> Keep `[x]` only where evidence proves completion.
>
> Reopen anything that fails verification.
>
> List every remaining requirement as `[ ]`.
>
> Prioritize the next safe item.
>
> Implement it.
>
> Test it.
>
> Verify it.
>
> Document it.
>
> Update memory.
>
> Then, and only then, mark it `[x]`.

---

# 24. FINAL PRINCIPLE

For ITM@15:

**Code written is not work completed.**

**A feature is complete only when it works, is secure, is tested, matches the requirement, survives regression, and is documented.**

Every checked box must mean:

# BUILT.

# TESTED.

# VERIFIED.

# SECURE.

# ALIGNED.

# DOCUMENTED.

# WORKING.
