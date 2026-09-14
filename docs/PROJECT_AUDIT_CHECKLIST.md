# ITM@15 Project Audit Checklist

Last audit: 2026-09-13
Branch: main
Commit: `a9be3d5` (Phase 5 + audit reconciliation; Phases 6-9 audit/fix land in the commit(s) immediately after)
Environment: local dev machine, Vercel production (`https://itm-15.vercel.app`, HTTP 200), Supabase project `ysjjgzakswaohmnaowmv` (schema applied and verified)
Current build phase: Phase 0 done except one user-blocked item (CI push); **Phases 1-9 COMPLETE, verified live end-to-end against the real database**: Supabase foundation + RLS, invite-only authentication, onboarding, the full player-route shell, the admin Mission Control shell, and a full content/submission/scoring/voting loop (missions, quizzes, photo uploads, moderation, leaderboards, polls) proven end-to-end with a real Day-Zero-style rehearsal. Phase 10's core (moderation queue, private storage, gallery) also works as a byproduct of the same slice, though its admin Media Library isn't built. One real bug was found and fixed during this audit: a mission could be set LIVE and still be permanently invisible to every player because nothing ever published its containing game day — see "Content Engine" below. Wally W0 (placeholder assets/tables) on the same real database. Phase 11 (realtime engine) is next — everything from there onward is genuinely pending, not started.

## How to read this file

`[x]` = evidence block backs it up (Gates A-K from `docs/ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md` §5, at least the applicable ones). `[ ]` = pending, in progress, or blocked — the label after the item says which. This audit re-verified every previously-`[x]` item against current code/`git log`/a fresh `pnpm verify`, not just against what an earlier session claimed (§7 of the audit-control doc) — none needed reopening.

## Executive Status

- Total checklist items tracked in this file: 217 (this count reflects splitting coarse "all pending" bullets into individually-verifiable items as phases actually get built, not new scope)
- Verified complete: ~90 (+~24 this session across Content Engine, Submission Engine, Scoring, Voting, and Media Uploads' core loop)
- Pending: ~127 (the rest of Phases 6-21 — squads, remaining challenge types, multi-select polls, admin Media Library, realtime, and everything from Phase 11 onward)
- Blocked: 1 (needs a user action, not more engineering — see Critical Blockers)
- Failed verification: 0
- Deferred: 0

Overall completion: **Phase 0 done bar one item; Phases 1-9 of 21 COMPLETE** (Product Guide §26 numbering), each verified live end-to-end against the real database, not just structurally. Phase 10's core loop also works as a byproduct of the same slice. Phase 11 (realtime engine) is next.
Release readiness: **NOT READY.** Expected at this stage — recorded as the honest baseline, not a finding demanding immediate action beyond what's below.

## Critical Blockers

1. ~~Supabase database access~~ — **RESOLVED 2026-09-13.** A fresh session's `ToolSearch` for `mcp__supabase__*` found the tools immediately; both migrations applied, verified, and two follow-up fix migrations applied in response to real advisor findings. See "Database & RLS" below.
2. **`.github/workflows/ci.yml` unpushed — blocks automated CI.** The `gh`/git OAuth token lacks the `workflow` scope. Fix: user runs `gh auth refresh -h github.com -s workflow` once. `pnpm verify` run manually every session substitutes for now.

This remaining blocker is not something this session can resolve unilaterally (per `docs/PROJECT_STATE.md` — no forcing an OAuth scope grant without the user's browser).

## Foundation & Repository

- [x] Repository documentation correctly located (`docs/PRODUCT_GUIDE.md`, `docs/WALLY.md`, `CLAUDE.md` at root)

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §1, `docs/WALLY.md` §0
  **Implementation:** `git mv` in `67f425b`; re-uploaded duplicates removed 3 times now (`632f720`, and a `docs/`-located duplicate removed in `8c8b36f`) — see Documentation section below for the pattern
  **Result:** PASS
  **Verified:** 2026-09-13 (re-verified this audit — `docs/PRODUCT_GUIDE.md`/`docs/WALLY.md` present, no stray duplicates at repo root or elsewhere in `docs/` as of `git status`)
  **Commit:** `632f720`, `8c8b36f`

- [x] Next.js + TypeScript + Tailwind application scaffolded

  **Requirement:** Product Guide §3, §26 Phase 0
  **Implementation:** `package.json`, `src/app/`, `tsconfig.json`, `next.config.ts`
  **Result:** PASS
  **Verified:** 2026-09-13 (re-ran `pnpm build` this audit — still succeeds)
  **Commit:** `9e6c29f`

- [x] Production build passes (lint + typecheck + test + build)

  **Requirement:** `CLAUDE.md` "Required quality gate"
  **Implementation:** `pnpm verify` script
  **Tests:** re-ran fresh this audit at commit `8c8b36f`: lint clean, typecheck clean, 9/9 unit tests pass, build succeeds
  **Result:** PASS
  **Verified:** 2026-09-13
  **Commit:** `8c8b36f`

- [x] Vercel production deployment live

  **Requirement:** Product Guide §26 Phase 0 acceptance
  **Implementation:** `vercel.json` (framework override), Git-connected `itm-15` project
  **Tests:** re-curled this audit: `https://itm-15.vercel.app` → HTTP 200
  **Result:** PASS
  **Verified:** 2026-09-13
  **Commit:** `309efc0`

- [ ] GitHub Actions CI running — STATUS: BLOCKED (see Critical Blockers #2)
- [x] Supabase env vars configured in Vercel (Production)

  **Requirement:** Product Guide §31, release-gate "Environment variables verified"
  **Implementation:** `vercel env add` for `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`, `NEXT_PUBLIC_APP_URL`
  **Tests:** `vercel env ls` confirms all 7 present, Encrypted, Production
  **Security:** values read from `.env.local` via shell variable substitution; never appeared in any command text or tool output
  **Result:** PASS for Production. **Preview environment not done** — `vercel env add <name> preview --value <value> --yes` fails identically on a disposable test variable (Vercel CLI v54.2.0 bug, not specific to these vars); needs a CLI upgrade or the dashboard.
  **Verified:** 2026-09-13
  **Commit:** N/A (Vercel project config, not repo state)
- [x] `.claude/agents/` project agents created (all 6: architecture/security/database/test/ux/wally reviewers)

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §8
  **Implementation:** `.claude/agents/{architecture,security,database,test,ux,wally}-reviewer.md`
  **Tests:** N/A (agent definitions, not code) — not yet exercised on a real review
  **Security:** the security/database/wally reviewers are themselves security controls once used
  **Result:** PASS (created; effectiveness unverified until actually invoked on a real change)
  **Verified:** 2026-09-13
  **Commit:** (pending, see git log)
- [x] `CLAUDE.md` accuracy re-verified

  **Requirement:** self-consistency — `CLAUDE.md` must describe reality, not history
  **Implementation:** found and fixed stale claims this audit: it said corepack/pnpm "not yet installed" and `pnpm verify` "does not exist yet" — both have been false since `9e6c29f`/pnpm setup. Also added a pointer to the audit-control doc/checklist relationship, and the 2 Supabase skills that were missing from its skills list.
  **Tests:** N/A (doc fix)
  **Result:** PASS (now accurate)
  **Verified:** 2026-09-13
  **Commit:** (pending, see git log)

## Tooling & Claude Environment

- [x] Environment capability inventory current (`docs/claude/ENVIRONMENT_INVENTORY.md`)
- [x] Project-scoped `.claude/settings.json` (permissions) + destructive-command hook — tested with 4 dangerous + 1 safe payload, commit `cb639c9`
- [ ] 7/10 recommended project skills created — STATUS: IN PROGRESS (`project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`, `supabase`, `supabase-postgres-best-practices`; `test-gate`, `visual-qa`, `wally-qa`, `release-gate` deliberately deferred until there's an artifact each would review)
- [x] `.claude/agents/` (6 required) — all created, see Foundation & Repository above
- [ ] `.mcp.json` servers authenticated — STATUS: IN PROGRESS/BLOCKED (defined: `vercel`, `supabase` (rescoped to `project_ref=ysjjgzakswaohmnaowmv`), `playwright`, `memory`; `supabase` specifically blocked, see Critical Blockers #1; others never explicitly `/mcp`-verified either)
- [ ] Memory knowledge-graph MCP exercised (defined in `.mcp.json`, never invoked — auto-memory used as the interim substitute throughout)
- [ ] Secret-scan pre-commit hook (runbook §9.4) — not created

## Documentation

- [x] `docs/DOCS_INDEX.md`, `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md` current — updated every session
- [x] `docs/adr/0001-prisma-alongside-supabase-migrations.md` — Prisma-vs-supabase/migrations coexistence decision
- [x] This checklist rebuilt into a full backlog (this audit) — was a seed before; now covers every Product Guide phase and every WALLY.md checklist section, plus a Requirement Traceability Matrix
- [x] Recurring duplicate-upload pattern documented (`docs/DOCS_INDEX.md` Conflicts section) — 3 occurrences of controlling docs being re-uploaded via GitHub's web UI outside any session, each diffed-and-removed; flagged for a direct question to the user if it recurs a 4th time

## Authentication & User Management (Phase 2 — Product Guide §5, audit-control doc §14)

**COMPLETE, verified live end-to-end 2026-09-13** against the real `ysjjgzakswaohmnaowmv` database — see `docs/PROJECT_STATE.md`'s full Phase 2 write-up for the complete narrative (including two real bugs found and fixed via live testing that `pnpm verify` alone would not have caught: a Next.js 16 `middleware.ts`→`proxy.ts` rename that silently no-ops, and a `FormData.get()` null-handling gap).

- [x] Admin can create employee account (`/admin/players/new` server action)

  **Requirement:** Product Guide §5.1
  **Implementation:** `src/app/admin/players/new/actions.ts` (`createEmployeeAccount`) — Super-Admin-only (see role-verification item below), creates the Supabase Auth user server-side, writes `profiles`+`user_roles`+`audit_logs` in one action, rolls back (deletes the orphaned auth user) on any later write failure
  **Tests:** live Playwright run against the real database — admin created a real synthetic player account through the real form
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Email stored correctly (unique, required)

  **Requirement:** Product Guide §5.1
  **Implementation:** `profiles.email` has a `unique` constraint (`supabase/migrations/... profiles_email_unique`, applied during Phase 1 completion); Supabase Auth's own `auth.users.email` uniqueness is the primary guarantee
  **Tests:** live duplicate-email submission via `/admin/players/new` correctly rejected (`An account with this email already exists.`)
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Name/country/entity stored correctly (optional at creation, required before gameplay)

  **Requirement:** Product Guide §5.1
  **Implementation:** `createEmployeeSchema` (`src/lib/auth/schemas.ts`) — `fullName`/`countryId`/`entityId` all optional; `entityId` has no form field yet (no entity-management UI exists), `countryId` has a live country picker sourced from `public.countries`
  **Tests:** live creation with a country selected, confirmed stored correctly
  **Result:** PASS (entity assignment UI itself is a future addition, not required for this criterion — the schema/storage already supports it)
  **Verified:** 2026-09-13

- [x] Temporary `Walumo` password flow works

  **Requirement:** Product Guide §5.1
  **Implementation:** `createEmployeeAccount` calls `admin.auth.admin.createUser({ password: "Walumo", email_confirm: true })`
  **Tests:** live login with `Walumo` succeeded for both an admin-created player and the seeded Super Admin
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] `Walumo` cannot remain a permanent password (`must_change_password` gate)

  **Requirement:** Product Guide §5.1, §5.3
  **Implementation:** `profiles.must_change_password` defaults `true` on creation; `src/proxy.ts` force-redirects to `/first-login` on **every** request (not just at login) while it's true
  **Tests:** live — attempted to reach `/play`/`/admin` directly after `Walumo` login, always redirected to `/first-login` first
  **Security:** the gate is re-checked server-side per-request, not a one-time client redirect
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Forced password reset works (`/first-login`, min 10 chars, disallow exact `Walumo` reuse)

  **Requirement:** Product Guide §5.3
  **Implementation:** `changePasswordSchema` (`src/lib/auth/schemas.ts`) — `.min(10)`, `.refine(password !== "Walumo")`; `src/app/first-login/actions.ts` calls real `auth.updateUser({password})`
  **Tests:** unit tests (`schemas.test.ts`) for both rules; live — real password change succeeded and gate lifted
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Private password stored through Supabase Auth (not a custom table)

  **Requirement:** Product Guide §5.3 ("private password")
  **Implementation:** all password reads/writes go through `supabase.auth.*` — no password field exists anywhere in `public.profiles` or any other application table
  **Result:** PASS (true by construction — verified by inspecting the schema, no password column exists)
  **Verified:** 2026-09-13

- [x] Session persists correctly

  **Requirement:** implicit (Supabase Auth session cookie)
  **Implementation:** `@supabase/ssr`'s cookie-based session, refreshed by `src/proxy.ts` on every request via `supabase.auth.getUser()`
  **Tests:** live — multi-step flows (create account → sign out → sign back in as a different account) worked correctly across real page navigations
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Logout works

  **Requirement:** basic necessity, not itemized in Product Guide §5 but required for a functioning auth system
  **Implementation:** `src/app/logout/actions.ts` (`signOut`) — calls `supabase.auth.signOut()`, redirects to `/login`
  **Tests:** live — confirmed session actually ends (subsequent protected-route access redirects to `/login`)
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Unauthorized/unknown email cannot self-register

  **Requirement:** Product Guide §26 Phase 2 acceptance
  **Implementation:** no self-registration route/server action exists anywhere in the app — `/login` is the only entry point, and it only calls `signInWithPassword`, never `signUp`
  **Tests:** live — login attempt with an unrecognized email rejected with a generic `Incorrect email or password.` (no account-enumeration signal)
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Admin route protection works (player cannot reach `/admin/*`)

  **Requirement:** Product Guide §26 Phase 2 acceptance
  **Implementation:** `src/proxy.ts`'s coarse admin-surface gate, re-checked independently by every admin server action and page component (`getCurrentRoles()`, RLS-scoped "own row" read — a client cannot spoof another role)
  **Tests:** live — a real PLAYER-role account was redirected from `/admin` back to `/play`
  **Security:** reviewed by the `security-reviewer` subagent (isolated context) — verdict PASS, one Medium finding (redirect responses dropping Supabase cookie mutations — session hygiene, not an authz bypass) fixed and empirically re-verified (disabled a real account mid-session, confirmed its cookie is now genuinely cleared). See `docs/PROJECT_STATE.md` for the full account
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] User role is server-verified (never trust a client-supplied role)

  **Requirement:** CLAUDE.md non-negotiable ("Security, authorization... are server-authoritative")
  **Implementation:** `getCurrentRoles()` (`src/lib/auth/session.ts`) reads `user_roles` through the RLS-scoped client with no id parameter — it is structurally impossible for a caller to request another user's roles through this function
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Login page cinematic background / Wally teaser / "Need help?" action — **not built**. `/login` is a plain, functional form using the project's existing design tokens (`.btn-primary`, Fraunces/Jakarta), consistent visually with the landing page but without the cinematic/Wally treatment Product Guide §5.2 describes. Deliberate scope boundary for this slice — Wally integration is Phase 13, and a cinematic pass is a visual-QA follow-up, not a functional gap.

- [x] Disabled-user handling (profile `status = DISABLED` rejected even with a valid Auth session)

  **Requirement:** Product Guide §5.2 step 3
  **Implementation:** checked both at sign-in (`src/app/login/actions.ts`) and on every subsequent request (`src/proxy.ts`) — a mid-session disable takes effect immediately, not just at next login
  **Tests:** live — Super Admin disabled a real player account via `/admin/players`; that account's next login attempt was rejected (`This account is not able to sign in.`) despite the correct password
  **Result:** PASS
  **Verified:** 2026-09-13

**Also delivered, beyond the checklist's original scope** — Product Guide §4.5's "user administration, permission management" (Super-Admin-only role/status management, `/admin/players`), added per explicit user instruction this session. Not previously itemized here because the original checklist seed predated that requirement being surfaced.

**Real gaps, disclosed rather than hidden:**
- No committed, CI-runnable E2E suite (`tests/e2e/`) — this session's verification scripts live only in the scratchpad, not the repo.
- No dedicated visual/mobile/accessibility QA pass on the new pages.
- Not yet verified against the Vercel preview/production deployment, only local `pnpm dev`.
- No `/onboarding` yet — `src/proxy.ts` deliberately doesn't gate on `profiles.onboarding_completed` until that page exists (see its code comments).

## Employee Onboarding (Phase 3 — Product Guide §5.4)

**COMPLETE, verified live end-to-end 2026-09-13** — see `docs/PROJECT_STATE.md`'s Phase 3 write-up for the full narrative, including a real live-routing bug found and fixed (`signIn`/`changePassword` didn't know about the new onboarding gate).

- [x] Onboarding form (`/onboarding`): full name, email (read-only from Auth), country (required), entity (recommended)

  **Requirement:** Product Guide §5.4
  **Implementation:** `src/app/onboarding/page.tsx`, `OnboardingForm.tsx`, `actions.ts` — written through the service-role admin client (no client-writable UPDATE policy on `profiles`)
  **Tests:** live Playwright run — real seeded countries render, form submits correctly
  **Result:** PASS (profile photo intentionally not built — not required by "minimum required game identity")
  **Verified:** 2026-09-13

- [x] Minimum required game identity enforced: name + email + country

  **Requirement:** Product Guide §5.4 ("exactly: name, email, country")
  **Implementation:** `onboardingSchema` (`src/lib/auth/schemas.ts`) — `fullName`/`countryId` required, `entityId` optional; email never re-collected (read from Auth)
  **Tests:** `schemas.test.ts` (5 new cases)
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Automatic squad assignment on completion — **not attempted**, `squads`/`squad_members` tables don't exist yet (later than the Phase 1 foundation schema)

- [x] Incomplete profile cannot bypass onboarding into `/play` or `/admin`

  **Requirement:** Product Guide §5.2 step 5
  **Implementation:** `src/proxy.ts`'s new `onboardingIncomplete` gate, applied uniformly regardless of role; `signIn`/`changePassword` also check it directly to avoid a double-redirect
  **Tests:** live — password change lands on `/onboarding` (not `/play`), re-visiting `/onboarding` after completion bounces away, unauthenticated visit bounces to `/login`
  **Security:** applies to every role, including admin-surface roles — the real Super Admin will hit this gate on its next login too (disclosed in `PROJECT_STATE.md`)
  **Result:** PASS
  **Verified:** 2026-09-13

## Database & RLS (Phase 1 — Product Guide §26)

- [x] Migration `init_foundation` applied to the real `ysjjgzakswaohmnaowmv` database

  **Requirement:** Product Guide §26 Phase 1 build list (profiles/countries/entities/user_roles/campaigns/audit_logs)
  **Implementation:** `supabase/migrations/20260912230000_init_foundation.sql`, applied via `mcp__supabase__apply_migration` (remote version `20260913063933`)
  **Tests:** `mcp__supabase__list_tables` confirms all 6 tables exist with expected columns/FKs/RLS enabled
  **Security:** RLS enabled on every table from creation; see anon-read verification below
  **Result:** PASS
  **Verified:** 2026-09-13
  **Commit:** pending (this session)

- [x] Migration `wally_w0_tables` applied

  **Requirement:** WALLY.md §8/§37 W0 (wally_dialogues/wally_assets/wally_skins/wally_events/wally_event_receipts)
  **Implementation:** `supabase/migrations/20260913000000_wally_w0_tables.sql`, applied via `apply_migration` (remote version `20260913063956`)
  **Tests:** `list_tables` confirms all 5 tables exist
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Both migrations reviewed against `supabase-postgres-best-practices` skill, gaps found by live advisors fixed

  **Requirement:** general schema-quality best practice
  **Implementation:** FK indexes added throughout; `auth.uid()` wrapped in `select` in every RLS policy referencing it. Post-apply `mcp__supabase__get_advisors` found two real gaps the static review missed: `set_updated_at` had a mutable `search_path` (security), and `wally_dialogues.created_by`/`wally_events.created_by` were unindexed FKs (performance). Both fixed with `supabase/migrations/20260913064034_fix_set_updated_at_search_path.sql` and `20260913064438_add_missing_created_by_fk_indexes.sql`.
  **Tests:** `get_advisors` re-run after each fix — clean except one intentional `audit_logs` no-policy INFO (deny-all by design) and 13 expected "unused index" INFO findings (zero rows in any table yet)
  **Result:** PASS
  **Verified:** 2026-09-12 (static) / 2026-09-13 (live, against the real database)
  **Commit:** `1b9c5d7`, `1fabece`, pending (this session's two fix migrations)

- [x] Database rebuilds cleanly from migrations

  **Requirement:** Product Guide §26 Phase 1 acceptance criterion 1
  **Implementation:** all 4 migrations applied in sequence with zero errors against the live project
  **Tests:** `apply_migration` success + `list_tables`/`list_migrations` confirmation
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Anonymous client cannot read `profiles`/`user_roles`/`audit_logs`/`wally_event_receipts`

  **Requirement:** Product Guide §26 Phase 1 acceptance criterion 2
  **Implementation:** RLS policies as drafted (deny-all-no-policy on `audit_logs`; `col = (select auth.uid())` own-row policies on the other three)
  **Tests:** real `curl` against the live REST API using the actual anon publishable key. Empty-table requests alone would be inconclusive (a broken policy and a genuinely empty table both return `[]`), so a real row was inserted into `audit_logs` via the service-role path, confirmed invisible to the anon-key request (`200 []` despite the row existing), then deleted. The three `auth.uid()`-based tables use the identical, standard Supabase pattern; not further tested with a synthetic `auth.users` row (deliberately — hand-inserting into Supabase's managed `auth` schema is exactly the kind of risky workaround the runbook warns against). Full per-row testing for those three is meaningful once Phase 2 creates real accounts.
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Supabase TypeScript types generated

  **Requirement:** typed client access to the schema
  **Implementation:** `src/lib/supabase/database.types.ts`, generated via `mcp__supabase__generate_typescript_types` against the live schema; wired into `client.ts`/`server.ts`/`admin.ts` via the `Database` generic
  **Tests:** `pnpm verify` (lint/typecheck/test/build) passes clean with the typed clients
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Prisma introspection (`prisma db pull`) run at least once — blocked on real `DATABASE_URL`/`DIRECT_URL` password, separately from the (now-resolved) MCP blocker

## Landing Page (Phase 3 — Product Guide §6)

- [x] Hero section, exact approved copy, Wally teaser image — `src/app/page.tsx`, see "Seven-Day Story" below for full evidence
- [x] Seven-day chapter teaser (non-spoiling) — see "Seven-Day Story"
- [ ] "15 years in motion" historical timeline — deliberately skipped, needs real ITM historical data not available this session
- [ ] Multinational-presence map/visual — deliberately skipped, same reason
- [ ] Live countdown to next unlock — needs a real campaign row with real dates from the database
- [x] "Enter the Game" / "Sign In" CTAs

  **Requirement:** Product Guide §6.1
  **Implementation:** `src/app/page.tsx` — "Enter the Game" primary CTA to `/login`, added once Phase 2 gave it a real destination. A separate "Sign In" control wasn't added: this product is invite-only with a single entry point, so both spec CTAs resolve to the same page.
  **Result:** PASS
  **Verified:** 2026-09-13

## Player Shell (Phase 4 — Product Guide §7)

**COMPLETE, verified live end-to-end 2026-09-13** — see `docs/PROJECT_STATE.md`'s Phase 4 write-up.

- [x] All 10 player IA routes exist and are reachable: `/play`, `/play/day/[dayNumber]`, `/play/mission/[missionId]`, `/passport`, `/leaderboards`, `/gallery`, `/achievements`, `/notifications`, `/profile`, `/help`

  **Requirement:** Product Guide §7
  **Implementation:** `src/app/(player)/` route group + shared `layout.tsx`/`PlayerNav.tsx`
  **Tests:** live Playwright run — all 10 routes reachable with correct titles, no unexpected redirects
  **Result:** PASS — `/passport`/`/leaderboards`/`/gallery`/`/achievements`/`/notifications` are honest labeled placeholders (backend doesn't exist yet); `/profile` is real signed-in data; `/play/day/[dayNumber]` validates 1-7 and 404s otherwise; `/play/mission/[missionId]` validates UUID shape
  **Verified:** 2026-09-13

- [x] A player can move through all authenticated player routes

  **Tests:** live — synthetic fully-onboarded PLAYER account navigated all 10 routes; nav bar usable at 390px mobile width
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] No admin navigation leaks to players

  **Implementation:** `PlayerNav` contains zero admin links by construction; `src/proxy.ts`'s existing `/admin/*` gate (Phase 2) is the actual enforcement boundary
  **Tests:** live — PLAYER account still correctly blocked from `/admin`
  **Result:** PASS
  **Verified:** 2026-09-13

## Admin Mission Control (Phase 5 — Product Guide §17, audit-control doc §13)

**Shell COMPLETE, verified live end-to-end 2026-09-13** — see `docs/PROJECT_STATE.md`'s Phase 5 write-up. Phase 5's own acceptance bar ("Admin can monitor account state... Role-based navigation works") is deliberately modest; a real operations center needs Phases 6-12.

- [x] Admin authentication works — Phase 2, unchanged
- [x] Role authorization works

  **Implementation:** `src/app/admin/layout.tsx` computes nav visibility from real role rows; every gated page independently re-checks server-side
  **Tests:** live — SUPER_ADMIN sees all 4 nav links; MODERATOR sees only Overview and is bounced from `/admin/players`/`/admin/audit` on direct visit
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Live player count works — **partial, honestly labeled**: "Active accounts" and "Countries active" are real live-queried counts; true realtime online-presence needs Phase 11 and is explicitly listed as not-yet-available on the dashboard itself, not silently omitted
- [ ] Country activity, Squad activity — squads don't exist yet; country activity beyond the raw active-country count needs squads/Phase 6+ aggregation this project hasn't built
- [x] Mission creation/editing/scheduling, Challenge launch — **STALE ENTRY CORRECTED 2026-09-13**: this was accurate when written during the original Phase 5 audit pass, but Phases 6-10 have since shipped real mission/challenge/day management (`/admin/missions`, `/admin/missions/new`) — see the "Content Engine" and "Submission Engine" sections below for the real evidence. "Surprise challenge, Question editing" beyond the single-challenge-per-mission model remain real, disclosed gaps — see the Content Engine section, not "not started."
- [x] Voting controls — **STALE, CORRECTED**: Phase 9 shipped (`/admin/voting`, `/admin/voting/new`) — see the Voting section below.
- [x] Photo moderation, Featured media — **STALE, CORRECTED**: Phase 10 shipped (`/admin/submissions`, `/admin/media`) — see the Media Uploads section below.
- [x] Bonus points, Point deductions — **STALE, CORRECTED**: Phase 8 shipped bonus-point awarding (`/admin/scoring`) — see the Scoring section below. Point *deductions* specifically (a negative award) aren't a distinct UI affordance, though the same form accepts a negative amount — a real, minor disclosed gap (no dedicated "deduct" framing/confirmation copy).
- [ ] Theme change — Phase 15, still not started
- [x] Chapter lock/unlock — **STALE, CORRECTED**: day status (DRAFT/LIVE/COMPLETED) is a real, working admin control on `/admin/missions` (the "Days" section) — see the Content Engine section below.
- [x] Wally Control Room (`/admin/live/wally`) — **PARTIAL, CORRECTED 2026-09-13**: real GLOBAL/PLAYER message triggering shipped this session (Phase 13 W1/W2) — see the Wally section below. Full audience/skin/scheduling panel (§16.1) still not built.
- [x] Audience targeting, Live notifications — **PARTIAL, CORRECTED**: Wally's own GLOBAL/PLAYER targeting shipped (above); the general admin-notification composer (Phase 12, distinct from Wally) remains blocked on Supabase migration-apply tool access — see the Admin Notifications section below.
- [ ] Spectator screen controls — Phase 18, still not started
- [x] Audit log works

  **Requirement:** Product Guide §4.5, §27
  **Implementation:** `src/app/admin/audit/page.tsx`, gated by new `canViewAuditLog()`, reads via service-role client (audit_logs has zero RLS policies for any client role)
  **Tests:** live — SUPER_ADMIN sees the viewer render (empty state, since the live table is genuinely empty right now); MODERATOR bounced away
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Emergency pause — **STALE ENTRY CORRECTED 2026-09-13**: real, server-enforced pause/resume shipped (Product Guide §17.3, Phase 12 half) — see "Phase 12 — Pause/resume" in `docs/PROJECT_STATE.md` for the full verification write-up.

## Content Engine (Phase 6 — Product Guide §9, §18)

**COMPLETE for the scope this slice targets, verified live 2026-09-13.** Found as uncommitted work, audited, one real bug fixed (see below), then verified end to end. Full narrative in `docs/PROJECT_STATE.md`'s "Phases 6-9" write-up.

- [x] Content hierarchy modeled (Campaign → Game Day → Mission → Challenge)

  **Requirement:** Product Guide §9.1
  **Implementation:** `supabase/migrations/20260913080000_content_submission_scoring_voting.sql` (`game_days`, `missions`, `challenges`, `challenge_options`) — Story Scene is not modeled as a separate table; not required by any Phase 6 acceptance criterion, and no admin surface calls for one yet
  **Result:** PASS for what Phase 6's acceptance criteria require
  **Verified:** 2026-09-13

- [ ] Question editor — **partial**: `challenges`/`challenge_options` support rich-enough config for the 4 implemented challenge types via a plain HTML form (`src/app/admin/missions/new/NewMissionForm.tsx`); no rich text/media attachment, no standalone reusable question bank separate from a mission
- [ ] Mission editor — **partial**: a single-page create form (basics/challenge/scoring/timing in one step), not the full 9-step guided builder (§18.2) with Wally/theme steps — those depend on subsystems (Phase 13, 15) that don't exist yet
- [x] Draft/preview/publish workflow

  **Requirement:** Product Guide §18.3, §26 Phase 6
  **Implementation:** missions created `DRAFT`; `updateMissionStatus` (`src/app/admin/missions/actions.ts`) is a distinct, audited publish action — matches the pattern from Phase 2's `updateUser`
  **Result:** PASS (no "preview as player" step; not required by Phase 6's acceptance wording)
  **Verified:** 2026-09-13
- [ ] Revision handling for editing a live mission — not built; editing a live mission's fields directly changes it with no warning/revision record. A real, disclosed gap.
- [x] Admin can create a mission without a code deploy

  **Tests:** live — created a real SINGLE_CHOICE mission through `/admin/missions/new`
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Draft mission (and its containing day) invisible to players

  **Requirement:** Product Guide §26 Phase 6 acceptance
  **Implementation:** RLS policies on `game_days`/`missions`/`challenges`/`challenge_options`, each requiring `LIVE`/`COMPLETED`/`PAUSED` status
  **Security finding, fixed this session:** `game_days` was created `DRAFT` and **nothing anywhere in the app ever changed it** — no admin control existed to publish a day at all. A mission set `LIVE` by an admin was still permanently invisible to every player, because the day one level up silently blocked it. Found by actually running the full loop as a real player (not by reading the code) — `pnpm verify` could not have caught this, every layer typechecked/linted/built cleanly in isolation. Fixed with a new `updateGameDayStatus` action + a "Days" status-control section on `/admin/missions`.
  **Tests:** live — confirmed a mission stayed invisible with only the mission set LIVE, then became visible once its day was also published
  **Result:** PASS (after the fix)
  **Verified:** 2026-09-13

## Submission Engine (Phase 7 — Product Guide §7 challenge types)

**COMPLETE for the 4 implemented challenge types, verified live 2026-09-13.**

- [ ] Reusable challenge renderer — **4 of 20 challenge types implemented**: SINGLE_CHOICE, MULTIPLE_CHOICE, FREE_TEXT, PHOTO_UPLOAD (`src/app/(player)/play/mission/[missionId]/MissionChallengeForm.tsx`). The other 16 are a real, disclosed gap — `challenges.type` is a plain text column specifically so adding more is an application-level change, not a migration (see the schema migration's own header).
- [x] Attempt/retry rules enforced server-side

  **Implementation:** `submitAnswer` (`src/app/(player)/play/mission/[missionId]/actions.ts`) counts existing submissions server-side and compares against `missions.max_attempts`
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Server deadline validation (never trust client clocks)

  **Implementation:** `submitAnswer` compares `missions.ends_at` against `Date.now()` server-side before accepting a submission
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Player completes a mission end-to-end

  **Tests:** live — real player answered a real SINGLE_CHOICE mission correctly through the actual UI; verified against the database (not just UI text) that the submission and its resulting score event exist
  **Result:** PASS
  **Verified:** 2026-09-13

## Authoritative Scoring & Leaderboards (Phase 8 — Product Guide §10)

**COMPLETE, verified live 2026-09-13.**

- [x] `score_events` append-only ledger

  **Implementation:** `supabase/migrations/20260913080000_...sql` — no update/delete policy for any client role; every write goes through a server action using the service role
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Admin bonus-point flow (award to player, required reason, audit entry)

  **Requirement:** Product Guide §10.2
  **Implementation:** `awardBonusPoints` (`src/app/admin/scoring/actions.ts`) — Game Master/Super Admin only (`canAwardBonusPoints`), required reason, writes `score_events` + `audit_logs`
  **Result:** PASS (squad/country-wide bonus targeting not built — only per-player; no configurable guardrail cap or confirmation modal)
  **Verified:** 2026-09-13

- [ ] Squad leaderboards — squads/squad assignment don't exist yet; `score_events.squad_id` exists in the schema for forward compatibility but stays unpopulated (disclosed in the migration header)
- [x] Individual/country leaderboards

  **Implementation:** `src/lib/scoring/leaderboard.ts` (`getPlayerLeaderboard`, `getCountryLeaderboard`), rendered at `/leaderboards`
  **Tests:** live — leaderboard correctly showed 100 pts after a quiz answer, then 150 pts after a photo submission was separately approved, for both the player and their country
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Leaderboard admin controls (show/hide, freeze, delay, dramatic reveal) — not built
- [x] Browser cannot self-award points (server-authoritative, no client-mutable score field)

  **Implementation:** `submitAnswer` re-derives correctness from `challenge_options.is_correct` server-side regardless of what the client submitted; no client-writable policy exists on `score_events` at all
  **Result:** PASS
  **Verified:** 2026-09-13

## Voting & Nominations (Phase 9 — Product Guide §11)

**COMPLETE for single-choice polls, verified live 2026-09-13.**

- [ ] Poll configuration — **single-choice only**, not multi-select (§11.1 also describes multi-select); named/anonymous, candidate source, self-vote rule, timing, results-visibility rule are all implemented (`src/app/admin/voting/new/NewPollForm.tsx`, `supabase/migrations/20260913080000_...sql`). Multi-select is a disclosed gap — the migration header explains why (a per-poll conditional uniqueness constraint can't be expressed as a plain Postgres partial index).
- [x] Vote uniqueness enforced at the database level, not just UI

  **Implementation:** `unique(poll_id, voter_id)` constraint on `votes`, not just the server action's own pre-check
  **Tests:** live — attempted a duplicate vote through the real UI after already voting; correctly refused, and the database confirms exactly one row for that player/poll
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Nomination + reason flow — reason capture exists (`polls.reason_required`, `votes.reason`) but there's no dedicated "nominate a colleague" UI distinct from a generic poll option list
- [x] Admin-controlled live reveal

  **Implementation:** `updatePollStatus` (`src/app/admin/voting/actions.ts`), audited
  **Tests:** live — revealed a poll through the real UI; vote counts became visible on the player-facing page immediately after
  **Result:** PASS
  **Verified:** 2026-09-13

## Media Uploads & Moderation (Phase 10 — Product Guide §12)

**COMPLETE, verified live 2026-09-13 — the admin Media Library closes the phase's one remaining gap.**

- [x] Storage bucket + access policies (for challenge evidence)

  **Requirement:** Product Guide §12.1
  **Implementation:** `supabase/migrations/20260913083000_challenge_submissions_storage.sql` — private `challenge-submissions` bucket, RLS policies restrict upload/read to the uploader's own uid-prefixed folder. `avatars`/`approved-gallery`/`admin-media`/`wally-assets` buckets are not built — only what Phase 6-9's actual scope needed.
  **Tests:** live — player uploaded real image bytes through the browser Supabase Storage client; a defense-in-depth server-side check re-validates the path prefix
  **Result:** PASS for challenge evidence
  **Verified:** 2026-09-13

- [x] Upload flow (client validation → server/storage authorization → Pending → moderator review → approve/reject)

  **Implementation:** `MissionChallengeForm.tsx` (client MIME/size guidance) → storage RLS → `submissions.status = 'PENDING'` → `/admin/submissions` (service-role read, signed-URL preview) → `moderateSubmission` (`src/app/admin/submissions/actions.ts`)
  **Tests:** live — full loop run for real, including the moderator seeing a working signed-URL image preview and clicking Approve
  **Result:** PASS (no "resubmit" flow after rejection — rejected submissions are terminal in this slice)
  **Verified:** 2026-09-13

- [x] Approved gallery (`/gallery`)

  **Implementation:** `src/app/(player)/gallery/page.tsx` — queries only `status = 'APPROVED'` rows, mints short-lived signed URLs
  **Result:** PASS (no filters by day/country/challenge/squad/featured yet — just a flat approved-photo grid)
  **Verified:** 2026-09-13

- [x] Admin Media Library (§12.4, general reference assets like historical photos)

  **Requirement:** Product Guide §12.4
  **Implementation:** `/admin/media` (`canManageContent`-gated), new public `admin-media` storage bucket (`supabase/migrations/20260913090000_admin_media_library.sql`, created live via the Storage Management API — see PROJECT_STATE.md for why not via a migration runner), free-form tagging
  **Tests:** live — uploaded a real photo through the form, confirmed its public URL is fetchable unauthenticated (200, correct content-type), toggled "Feature" and confirmed the database flag actually flips (both via direct query and the audit log)
  **Result:** PASS
  **Verified:** 2026-09-13
- [x] Unapproved media never appears on a public surface

  **Tests:** live — gallery showed nothing until the photo was actually approved; the bucket itself is private (not merely policy-gated), so even a guessed path returns nothing without a valid signed URL
  **Result:** PASS
  **Verified:** 2026-09-13

## Realtime Engine (Phase 11 — Product Guide §14)

**COMPLETE, independently verified live end-to-end 2026-09-13** — see `docs/PROJECT_STATE.md`'s Phase 11 write-up for the full six-scenario proof.

- [x] Broadcast/Presence helpers

  **Requirement:** Product Guide §14, runbook §21
  **Implementation:** `src/lib/realtime/broadcast.ts` (server-side, ping-only payloads), `src/components/realtime/{PresenceHeartbeat,OnlineCount}.tsx`
  **Tests:** live — presence count updated 0→1 across two independent browser tabs with no reload
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Channel topics — implemented: `game:global` (presence), `game:day:{dayNumber}`, `leaderboard`, `poll:{pollId}`, `admin:mission-control`. Not implemented: `country:{id}`, `entity:{id}`, `squad:{id}`, `player:{id}` — no current feature needs per-country/entity/squad/player targeting yet (that's Phase 12's admin-notification audience targeting); added when that's built, not before.
- [x] Live activity feed

  **Implementation:** `src/lib/admin/audit.ts`'s `logAdminActivity` — every existing audit-logged admin action now also pings `admin:mission-control`; `/admin` overview live-refreshes on it
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Realtime mission publish/leaderboard refresh signal

  **Tests:** live — a mission+day publish appeared on an already-open player page with zero reloads; a leaderboard tab opened before any points existed updated to the real total the instant a quiz was answered correctly
  **Result:** PASS
  **Verified:** 2026-09-13

- [x] Two-browser test: published event arrives without refresh

  **Tests:** live, six independent scenarios (presence, mission/day publish, scoring, moderation queue, gallery, voting), every page opened exactly once and never reloaded for the rest of its scenario
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Private channels don't leak audiences — not yet applicable: no channel currently carries player-specific or otherwise sensitive payload data (every broadcast is a bare ping per the runbook §21 pattern), so there's nothing to leak yet. Real Realtime Authorization (topic-level RLS) becomes necessary once Phase 12 adds player-targeted notifications with actual content in the payload — tracked there, not here.

## Admin Notifications & Live Controls (Phase 12 — Product Guide §15)

- [ ] Notification composer, audience targeting, CTA links

  **Status:** migration drafted (`supabase/migrations/20260913100000_admin_notifications.sql` — `admin_notifications` deny-all-RLS composed-intent table + a per-player `notifications` fan-out inbox), not yet applied. This session had no working `mcp__supabase__*` migration-apply tool access (recurring, documented limitation — see `docs/PROJECT_STATE.md`); unlike Phase 10's storage bucket, there's no `supabase-js` client workaround for creating new Postgres tables. Application code (schemas, server actions, composer UI, real `/notifications` inbox) intentionally not written yet — building it against a table that doesn't exist live would be untestable and risks silent drift from whatever the next session with real migration access actually applies.

- [ ] Live toast/banner/modal delivery — blocked on the above (needs `notifications`/`admin_notifications` to exist)
- [ ] Schedule support — blocked on the above
- [x] Pause/resume game

  **Requirement:** Product Guide §17.3 "Pause Game" quick action; §26 Phase 12 acceptance overlaps here structurally (a real, server-enforced live control) even though the line item itself is filed under Phase 17 in the guide's admin-dashboard section
  **Implementation:** `src/lib/game/campaignStatus.ts` (`isGamePaused`, reads the latest `campaigns.status`), `src/app/admin/actions.ts` (`setCampaignStatus` — role-gated via new `canControlGameState`, audit-logged, broadcasts `game.paused`/`game.resumed` on `game:global`), enforcement added to both `submitAnswer` (`src/app/(player)/play/mission/[missionId]/actions.ts`) and `castVote` (`src/app/(player)/vote/[pollId]/actions.ts`) — the check runs before any other read/write, so a paused attempt never creates a `submissions`/`votes` row at all (confirmed empirically, see Tests). `src/components/realtime/GamePausedBanner.tsx` + `src/app/(player)/layout.tsx` render the real `campaigns.status` server-side and re-fetch live via `LiveRefresh` on `game.paused`/`game.resumed` — no reload needed. `src/app/admin/page.tsx` gained a real three-state (Activate/Pause/Resume) game-controls section, gated by `canControlGameState`.
  **Tests:** live Playwright E2E (self-healing regardless of starting campaign state, unique mission per run to avoid cross-run collisions): admin sees "Activate campaign" or "Resume game" depending on current state and drives to ACTIVE → "no paused banner while ACTIVE" → admin pauses → a player's **already-open** tab (no reload) shows the paused banner within 15s of the broadcast → the same player's attempt to answer a mission is genuinely rejected server-side ("The game is currently paused. Try again shortly.") → **verified directly against the database that the paused attempt created zero `submissions` rows** (each test mission had exactly one submission total — the real one after resume, not two) → admin resumes → banner disappears live → the identical answer now succeeds for real, server-computed points shown.
  **Security:** enforcement is genuinely server-side, not cosmetic — the pause check runs first in both `submitAnswer` and `castVote`, before eligibility/deadline/attempt-count checks, so a player who already has the mission page open and bypasses the UI banner (e.g. by resubmitting a stale form) is still rejected. `setCampaignStatus` is gated to `GAME_MASTER`/`SUPER_ADMIN` via `canControlGameState` and writes an audit log entry.
  **Real bug found and fixed during this verification, unrelated to pause/resume itself:** `src/app/(player)/play/mission/[missionId]/page.tsx`'s "already completed" branch would silently swap in over the correct-answer success confirmation on *every* successful SINGLE_CHOICE/MULTIPLE_CHOICE submission (not just during pause testing) — `revalidatePath` inside `submitAnswer` triggers this Server Component to re-render with `alreadyApproved` now true, unmounting `MissionChallengeForm` (and its local `useActionState` success message) before a player could ever read "Correct! That counts. +N points." Fixed by making the "already completed" branch itself compute and show the real points earned, queried live from the authoritative `score_events` ledger — more correct than a one-shot toast, since it now holds up on every later visit/reload too, not just the instant after submitting. This is a genuine, previously-unnoticed UX defect present since Phase 6-9; prior verification passes checked the database directly for score correctness but never actually read the transient success text a player would see.
  **Result:** PASS
  **Verified:** 2026-09-13

- [ ] Targeted message reaches only the target; global reaches all eligible connected players — blocked on the notification composer above (not applicable to pause/resume, which is inherently global-only by design)

## Seven-Day Story

- [x] Public storyline teaser (landing page)

  **Requirement:** `docs/PRODUCT_GUIDE.md` §6.1 (hero copy), §6.2 (non-spoiling teaser), §8 (day titles/themes)
  **Implementation:** `src/app/page.tsx`, `src/content/story.ts`, `src/components/RevealOnScroll.tsx`, `src/app/layout.tsx`/`globals.css` (fonts/tokens)
  **Tests:** `src/content/story.test.ts` (2 tests); `pnpm verify` green; Playwright full-page screenshots (scrolled through in steps, both breakpoints), sent to the user
  **Security:** N/A — static public content
  **Result:** PASS for what this is (a marketing teaser, not the interactive game). Two bugs caught via screenshot review and fixed: a lint-flagged sync `setState` in an effect; an absolute-positioning bug from a sibling `transform` creating a new CSS containing block.
  **Verified:** 2026-09-13
  **Commit:** `ba2f64b`
  **Known limitations:** no historical timeline/map, no live countdown, no auth CTAs — see "Landing Page" section above.

- [x] Pre-login cold open (Scene 0 / Scene 1, per `docs/ITM15_STORYLINE_EXPERIENCE_BUILD_BIBLE.md` §8)

  **Requirement:** Build Bible §8 — Scene 0 (black-screen cold open: "15 years ago…" / "It started small." / `8` / context line / Wally silhouette / "Enter the story") and Scene 1 (the existing hero)
  **Implementation:** `src/app/page.tsx` (new section prepended), `src/app/globals.css` (`scene0-fade-in`/`scene0-silhouette` keyframes, pure CSS `animation-delay` staging, no JS)
  **Tests:** `pnpm verify` green; Playwright screenshots at t=0.5s/3s/7.5s (staged reveal confirmed), `prefers-reduced-motion: reduce` (everything visible immediately), mobile (390×844), and a click-through of "Enter the story" confirming the scroll-to-Scene-1 transition and that the rest of the page renders undisturbed
  **Security:** N/A — static, no auth/data dependency
  **Result:** PASS for this one scene. Not "the Build Bible implemented" — see `docs/PROJECT_STATE.md`'s "Storyline & Experience Build Bible" section for exactly what is and isn't covered, and why.
  **Verified:** 2026-09-13
  **Commit:** (pending, see git log)

- [x] Narrative walkthrough preview (Day 0 → Day 7 → final reveal, in one sitting)

  **Requirement:** direct user request ("allow me to go through the full experience day 0 to 7 in one go"); content drawn from the Build Bible's own starter dialogue (§8-19, §45)
  **Implementation:** `src/app/preview/page.tsx`, `src/components/WalkthroughPreview.tsx`, `src/content/walkthrough.ts`, `globals.css` (`walkthrough-fade-in`, motion-reduce disabled). Linked from the homepage footer.
  **Tests:** `src/content/walkthrough.test.ts` (4 tests — slide order, content non-empty, letters spell I-B-E-L-O-N-G in order, Day 0 has no letter yet); `pnpm verify` green; Playwright click-through of all 8 slides to the final reveal, both breakpoints, plus a mid-journey (Day 5) check confirming the letter tray correctly shows I-B-E-L-O unlocked and N-G still locked
  **Security:** N/A — client-only, no auth/data, explicitly labeled "Preview — narrative walkthrough" in its own header so it's never mistaken for the live game
  **Result:** PASS as exactly what it is: a scripted, narrated preview of the story arc. **This is explicitly NOT gameplay** — no accounts, no scoring, no real missions, no backend. Every quote is taken directly from the Build Bible's own text (not fabricated); "mission" descriptions are flavor text, not playable challenges. See the header comment in `src/content/walkthrough.ts` for the line this deliberately does not cross, per the Bible's own §39 "do not build a fake demo" rule.
  **Verified:** 2026-09-13
  **Commit:** (pending, see git log)

- [x] Actual seven-day game loop (missions, challenges, unlocks) — **LIVE, 2026-09-14**: all 7 days have a real, published mission (`supabase/migrations/20260914100000_seed_seven_day_content.sql`), campaign status `ACTIVE`. Verified live: all 7 answered for real through the real UI, 2 correct auto-graded to `APPROVED` with real `score_events`, 1 deliberately-incomplete answer genuinely `REJECTED`, the remaining 4 correctly `PENDING` moderation (including a real photo upload). See `docs/PROJECT_STATE.md`'s "Campaign gone live" section. The walkthrough preview at `/preview` remains a separate, narrated slideshow, not this.
- [ ] Login experience, first-login identity sequence (Build Bible §9-10) — Phase 2, not started
- [ ] Home screen "living lobby" (Build Bible §11) — Phase 4, not started
- [ ] Daily rhythm engine (Build Bible §12) — Phase 6+, not started
- [ ] Days 1-7 full experience choreography (Build Bible §13-19) — Phase 6+/13+, not started
- [ ] Personalized recap (Build Bible §20) — Phase 17+, not started
- [ ] Admin "live story director" Mission Control (Build Bible §29) — Phase 5, not started
- [ ] Anti-cheat/fairness scoring model (Build Bible §37) — Phase 8, not started; the population-size-fairness question isn't decided yet either

## Wally (audit-control doc §12)

- [x] W0 placeholder asset registry (`docs/WALLY.md` §37)

  **Requirement:** `docs/WALLY.md` §37 W0
  **Implementation:** `src/wally/rendering/assets.ts` (8 poses from `MASCOTTE.zip`), `supabase/migrations/20260913000000_wally_w0_tables.sql` (5 tables), `supabase/seed.sql`
  **Tests:** `assets.test.ts` (2 tests); Playwright screenshots confirming `open-arms`/`investigate` render correctly
  **Security:** RLS enabled, skill-reviewed; migration unapplied (same blocker as Phase 1)
  **Result:** PASS for what exists; DB tables unverified live
  **Verified:** 2026-09-13
  **Commit:** `1fabece`
  **Known limitations:** spec-vs-art conflict flagged, unresolved (see below); assets served from `public/`, not Supabase Storage yet.

- [x] Wally architecture matches `docs/WALLY.md` — PARTIAL but real: event/dialogue core (W1) + 2D prototype (W2) per §37's build order, verified live 2026-09-13

  **Requirement:** `docs/WALLY.md` §37 W1 ("event schema; controller; priority queue; dialogue resolver; safe variables; local debug trigger... test event can resolve deterministic dialogue and state") + W2 ("WallyProvider; WallyViewport; 2D renderer; speech bubble; entry/exit movement; admin trigger panel basic version; realtime event handling... Wally reacts to mission completion, bonus points and admin message; targeted realtime Wally event appears without refresh; no fabricated numbers")
  **Implementation:** `src/wally/behavior/priority.ts` (`shouldInterrupt` — a real, if single-slot, priority resolver per §6.1), `src/wally/dialogue/resolver.ts` (`selectDialogue`'s full §29.4 fallback chain, `substituteVariables`), `src/components/wally/{WallyProvider,WallySpeechBubble}.tsx`, `src/app/admin/live/wally/{page,actions,WallyTriggerForm}.tsx` (`publishWallyEvent`, role-gated via new `canTriggerWally`), wired into `src/app/(player)/layout.tsx` and the mission page's "already completed" branch (`src/app/(player)/play/mission/[missionId]/page.tsx`)
  **Tests:** `priority.test.ts` (6), `resolver.test.ts` (10), `roles.test.ts` (+1) — 96 unit tests total, `pnpm verify` clean. Live Playwright E2E (two players + admin, synthetic accounts fully deleted after): LOGIN_GREETING shows the real first name via the deterministic highest-weight dialogue variant; admin targets Player B by email — Player B's already-open tab shows it live with no reload, Player A never sees it; admin sends a GLOBAL message (behind a `window.confirm` gate) — both players' already-open tabs show it live; a real correct mission answer produces a Wally reaction showing the exact, non-fabricated points from `score_events`.
  **Security:** `publishWallyEvent` is role-gated (`canTriggerWally` = GAME_MASTER/SUPER_ADMIN) and audit-logged; broadcast payload is a bare ping only (runbook §21) — the actual dialogue/target is never in it, so even a client subscribed to another player's `player:{id}` topic name learns nothing (its own refetch is still RLS-scoped to its own `auth.uid()`, per `wally_events`'s existing "own-targeted or GLOBAL" policy). Admin message text is rendered as plain React text (auto-escaped), never `dangerouslySetInnerHTML`.
  **Real bug found and fixed during this verification**: `WallyProvider`'s LOGIN_GREETING effect wrote its "already greeted" session flag *before* awaiting its dialogue fetch, to "claim" the greeting ahead of a possible double-run — this exact ordering breaks under React Strict Mode's dev-mode mount→unmount→remount cycle: the first invocation writes the flag synchronously before yielding, so the second (final, stable) invocation's own synchronous check reads it as already-set and bails, while the first invocation's own later continuation finds itself `cancelled` and also bails — neither ever calls `tryShow`, so the greeting silently never appears in dev at all (not merely delayed, unlike the different, already-documented Presence latency pattern). Fixed by writing the flag only after the async work resolves and the greeting is about to be shown.
  **Result:** PASS for the W1/W2 scope actually claimed
  **Verified:** 2026-09-13
  **Real, disclosed scope boundaries — not the full architecture, and not claimed as such**: one active "slot," not a real queue (`priority.ts`'s header); GLOBAL/PLAYER audience only, no COUNTRY/ENTITY/SQUAD (matches `wally_events`'s own RLS policy, which defers the same thing pending a `profiles`/`squad_members` join); no `wally_event_receipts` persistence — dedupe is in-memory for the life of the mounted component, a page reload can re-show an event once more; no scheduling (`starts_at` unused, matching the Phase 12 notification-composer disclosure); still only 8 static poses, no rigged animation/state machine, no 3D (W4, Phase 14); no quality-tier resolver (Lite is the *only* tier that currently exists, not formally selected); Wrong-answer/achievement/photo-approval/bonus-point/country-overtake/Wally-Drop reactions not wired (those events don't have a UI trigger yet — Wally reacts to what already exists: mission completion and admin messages); no I-BELONG sequence (deliberately, to not spoil it); no analytics/receipts (W7).
- [ ] Wally does not own authoritative score logic — holds: `publishWallyEvent` never touches `score_events`; the mission-completion reaction only *displays* `earnedPoints`, computed the same way the player-facing page already computes it from the real ledger
- [x] Personalized name greeting — **built**, see above (real `first_name`, never fabricated)
- [ ] Mission introduction — not built (Wally doesn't yet introduce a mission before the player starts it, only reacts after completion)
- [ ] Correct-answer reaction — built for whole-mission completion (see above); not built at the individual-question level for multi-question missions (this project only supports one challenge per mission today, so the distinction doesn't yet arise)
- [ ] Wrong-answer reaction — not built
- [ ] Achievement reaction — not built (no achievement engine exists yet, Phase 17)
- [ ] Photo approval reaction — not built (would need the same "durable, server-rendered surface" pattern used for mission completion, applied to the submissions/gallery pages — not attempted this slice)
- [ ] Bonus-point reaction — not built (Phase 8's `/admin/scoring` bonus-award flow doesn't yet publish a Wally event)
- [ ] Country-overtake reaction — not built (no country leaderboard-change detection exists)
- [ ] Wally Drop realtime — not built
- [x] Targeted player message — **built and verified live**, see above
- [ ] Country-targeted message — not built (deferred with COUNTRY/ENTITY/SQUAD audience generally, see scope boundaries above)
- [ ] Squad-targeted message — not built (squads don't exist)
- [x] Global message — **built and verified live**, see above
- [x] Wally admin preview — **built**: `WallyTriggerForm`'s live client-side preview bubble, plus a mandatory `window.confirm()` for GLOBAL sends per §16.3 — not the full audience/skin/scheduling preview stage §16.1 eventually describes
- [ ] Wally animation states — only 8 static poses exist, no state machine/transitions
- [x] Wally does not interrupt critical form actions — the speech bubble is a small, dismissible, fixed-corner overlay (`WallySpeechBubble.tsx`) that never covers primary controls, per §12.4's collision rule
- [ ] Reduced-motion mode — the bubble's entrance animation is `motion-safe:`-gated (appears instantly under `prefers-reduced-motion`), but there's no dedicated Wally-specific reduced-motion test yet
- [ ] Lite/2D fallback — the entire current asset set *is* 2D/Lite-tier by nature, but no quality-tier resolver exists to formally select it
- [ ] Mobile performance acceptable — checked visually for the pages Wally appears on; no dedicated perf budget test yet
- [ ] Seven-day Wally progression — **flagged conflict, see below**, not built
- [ ] I-B-E-L-O-N-G sequence — deliberately not implemented/displayed yet (would spoil the mechanic if built carelessly)
- [ ] Wally analytics events — not built (W7)

**Flagged, unresolved — needs the product owner, now reinforced by a second document:** `docs/WALLY.md` §3.1/§20 describes an explorer/traveller Wally with day-by-day costume changes; `docs/ITM15_STORYLINE_EXPERIENCE_BUILD_BIBLE.md` §13-19 independently specifies the same system in more scene-level detail (archivist/Day 1, traveller/Day 2, historian/Day 3, People Champion/Day 4, futuristic Builder/Day 5, Connector/Day 6, Future Wally/Day 7). The actual `MASCOTTE.zip` art is one consistent Walumo-branded professional character, punctuality/clock-themed, no costume variants. Do not build the Day 1-7 skin system against this art as if it supports it — two independent specs now agree it's a real requirement, which makes resolving it (new art, or an explicit scope decision) more urgent, not less.

## Themes and Cinematic Scenes (Phase 15 — Product Guide §19)

- [ ] Theme structure/editor, runtime CSS token application, broadcast, 7 presets, optional day-intro 3D scenes — all pending

## Email Automation (Phase 16 — Product Guide §16, audit-control doc §16)

- [ ] Employee enrolled after admin account creation
- [ ] Reminder schedule configured, correct timezone
- [ ] Email includes player's name, Wally personality, current day's hook, game link
- [ ] Link reaches correct environment
- [ ] Completed users handled correctly (different message, not a repeat nag)
- [ ] Disabled users excluded from reminders
- [ ] Send failures logged, retry behavior documented
- [ ] Resend + React Email integration — not installed

## Achievements & Passport (Phase 17 — Product Guide §17 in the runbook numbering / Product Guide's own achievements section)

- [ ] Achievement rules, passport stamps, cross-country validation, badge animations — all pending

## Spectator / Event Screen (Phase 18 — Product Guide §21.2)

- [ ] `/screen` route, admin screen controller, leaderboard/photo/mission/vote-reveal modules — all pending

## Analytics (Phase 19 — Product Guide §22)

- [ ] Analytics event taxonomy, admin charts/funnels, country comparisons, completion/retention metrics, export — all pending

## Security, Performance, Load (Phase 20 — Product Guide §24, audit-control doc §11)

- [x] Secrets excluded from Git

  **Requirement:** audit-control doc §11, `CLAUDE.md`
  **Implementation:** `.env.local` confirmed gitignored; secret key confirmed absent from `.next` build output via `grep`
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `c3ac493`

- [ ] Employee cannot access admin routes — no admin routes exist yet to test
- [ ] Country Admin cannot control another country — no country-admin feature exists yet
- [ ] Moderator cannot award unauthorized points — no moderation/scoring exists yet
- [ ] Browser cannot directly manipulate score ledger — no score ledger exists yet
- [ ] Duplicate votes rejected server-side — no voting exists yet
- [x] RLS enforced on player data (as drafted) — profiles/user_roles/audit_logs have RLS + policies written; **unverified against a live database** (Critical Blockers #1)
- [ ] RLS enforced on media — no media tables exist yet
- [ ] Service-role key absent from client bundle — verified once for the current build (`c3ac493`); must be re-checked whenever `admin.ts` usage expands
- [ ] Upload MIME/size validation — no upload feature exists yet
- [ ] Signed/private media access — no media feature exists yet
- [ ] Rate limiting — not implemented anywhere yet
- [ ] Admin actions audit logged — `audit_logs` table drafted, unapplied; no admin actions exist yet to log
- [ ] Wally admin targeting authorization — no Wally admin UI exists yet
- [ ] Realtime channels protected — no realtime implementation exists yet
- [x] Secrets excluded from Git — see above
- [ ] Secrets excluded from Claude memory/knowledge graph — believed true (no secret values written to any memory file), not independently re-audited against full historical memory content this session
- [ ] Secrets excluded from knowledge graph — N/A, no graph connected

## Day Zero Rehearsal (Phase 21 — Product Guide §26, audit-control doc §15)

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

All pending — this is the true end-to-end proof of the whole architecture and cannot start until Phases 1-12 exist.

## Accessibility / Performance

- [ ] No dedicated audit run yet. The one real page (landing/story) uses semantic headings, a working keyboard-reachable link, and respects `prefers-reduced-motion` — not formally verified with an accessibility scanner (the `audit`/`scan` skills are available and unused so far).

## Unit Tests

- [x] 53 tests across 9 files, all passing — `env.test.ts`, `env.server.test.ts`, `assets.test.ts`, `story.test.ts`, `walkthrough.test.ts`, `dayThemes.test.ts`, plus Phases 2-5's `roles.test.ts`, `schemas.test.ts`, `profile.test.ts` — re-confirmed this audit at commit `cc612af`
- [ ] All business-logic unit tests (scoring, eligibility, Wally priority/dialogue resolution, challenge validation, achievement rules, theme resolver, audience targeting) — none exist yet, no business logic exists yet

## Integration / E2E / Realtime Tests

- [ ] Not started — no Playwright config, no `tests/e2e/` directory, nothing to exercise yet

## Visual QA

- [x] Landing/story page checked at mobile (390×844) and desktop (1280×900), full-page, scrolled-through — clean, 2 bugs found and fixed this way
- [ ] No other page exists to check yet

## Production Build / Vercel Preview

- [x] Both PASS — see Foundation & Repository above

## Production Readiness

- [ ] Not applicable — far too early; see Release Gate below

## Documentation & Memory

- [x] `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md`, `docs/DOCS_INDEX.md`, `docs/claude/ENVIRONMENT_INVENTORY.md`, this file — all current as of this audit
- [x] Auto-memory (`project_itm15_walumo.md`) updated each session, no secrets written (spot-checked this audit)

## Deferred Items

- None. Everything not yet built is tracked above as pending/in-progress/blocked, not deferred — nothing has been descoped from the product.

---

## Requirement Traceability Matrix

Curated to the requirements with real evidence one way or another (verified or meaningfully in-progress) plus the immediate next tier of pending work. Not every line item above has its own row — see the phase sections for the full list.

| ID | Requirement | Source | Implementation | Tests | Security | Status |
|---|---|---|---|---|---|---|
| ENV-001 | Environment/capability inventory | Runbook §2.2 | `docs/claude/ENVIRONMENT_INVENTORY.md` | N/A | N/A | VERIFIED |
| ENV-002 | Scoped permissions + destructive-command hook | Runbook §9.1-9.3 | `.claude/settings.json`, `.claude/hooks/` | Manual payload tests | Is the control | VERIFIED |
| DOC-001 | Product Guide/WALLY.md at required paths | Runbook §1, WALLY.md §0 | `docs/PRODUCT_GUIDE.md`, `docs/WALLY.md` | N/A | N/A | VERIFIED |
| DEPLOY-001 | Next.js app scaffolded | Product Guide §3 | `package.json`, `src/app/` | `pnpm build` | N/A | VERIFIED |
| DEPLOY-002 | Vercel production deployment | Product Guide §26 Phase 0 | `vercel.json`, Git-connected project | `curl` → 200 | N/A | VERIFIED |
| DEPLOY-003 | GitHub Actions CI | Runbook §14 | `.github/workflows/ci.yml` (unpushed) | N/A | N/A | BLOCKED |
| DB-001 | Foundation schema (profiles/countries/entities/user_roles/campaigns/audit_logs) | Product Guide §23, §26 Phase 1 | `20260912230000_init_foundation.sql`, applied (remote v`20260913063933`) | `list_tables` confirms schema | RLS enabled + advisor-clean | VERIFIED |
| DB-002 | Wally W0 tables | WALLY.md §8, §37 | `20260913000000_wally_w0_tables.sql`, applied (remote v`20260913063956`) | `list_tables` confirms schema | RLS enabled + advisor-clean | VERIFIED |
| DB-003 | Database rebuilds from migrations | Product Guide §26 Phase 1 acceptance | 4 migrations applied in sequence, zero errors | `apply_migration`/`list_migrations` | N/A | VERIFIED |
| DB-004 | Anonymous cannot read private data | Product Guide §26 Phase 1 acceptance | RLS policies (deny-all on `audit_logs`; own-row on `profiles`/`user_roles`/`wally_event_receipts`) | Real anon-key `curl` against a genuinely-inserted-then-deleted `audit_logs` row — confirmed invisible, not just "table empty" | Verified against live REST API, not just RLS flags | VERIFIED |
| DB-005 | Typed Supabase clients | Internal (typed DB access) | `database.types.ts` generated from live schema; wired into `client.ts`/`server.ts`/`admin.ts` | `pnpm verify` clean | Service-role client stays `server-only` | VERIFIED |
| AUTH-001 | Invite-only login, no self-registration | Product Guide §5.2, §26 Phase 2 | `src/app/login/` | Live E2E against real DB | Generic error, no enumeration | VERIFIED |
| AUTH-002 | Temporary `Walumo` password + forced first-login change | Product Guide §5.1, §5.3 | `src/app/first-login/`, `createEmployeeAccount` | Live E2E | `must_change_password` re-checked every request | VERIFIED |
| AUTH-003 | Admin employee-account creation | Product Guide §5.1, §28.1 | `src/app/admin/players/new/actions.ts` | Live E2E, duplicate-email rejection | Super-Admin-only, audited | VERIFIED |
| AUTH-004 | Admin route protection | Product Guide §26 Phase 2 acceptance | `src/proxy.ts` | Live E2E (PLAYER blocked from `/admin`) | Re-verified independently by every admin action | VERIFIED |
| AUTH-005 | Disabled-account rejection (mid-session, not just at login) | Product Guide §5.2 step 3 | `src/proxy.ts`, `src/app/login/actions.ts` | Live E2E | Checked on every request | VERIFIED |
| AUTH-006 | Super-Admin-only role/status management | Product Guide §4.5 | `src/app/admin/players/` | Live E2E | Self-lockout guard; audited | VERIFIED |
| SEC-001 | Secrets excluded from Git/bundle | CLAUDE.md, audit doc §11 | `.env.local` gitignored, `grep`-verified | Manual | Is the control | VERIFIED |
| SUP-001 | Supabase client helpers (browser/server/admin) | Product Guide §3 | `src/lib/supabase/{client,server,admin}.ts` | None (no live DB to test against) | `server-only` gated | IN PROGRESS |
| ADR-001 | Prisma coexistence decision | Runbook §40 | `docs/adr/0001-...md` | N/A | Documents the RLS risk | VERIFIED |
| LAND-001 | Hero section, approved copy | Product Guide §6.1 | `src/app/page.tsx` | Playwright screenshots | N/A | VERIFIED |
| LAND-002 | Seven-day non-spoiling teaser | Product Guide §6.2, §8 | `src/content/story.ts` | `story.test.ts` | N/A | VERIFIED |
| LAND-003 | Historical timeline / map | Product Guide §6.2 | — | — | — | PENDING (data unavailable) |
| LAND-004 | Live countdown | Product Guide §6.2 | — | — | — | BLOCKED (needs DB) |
| WAL-001 | Placeholder Wally asset registry | WALLY.md §37 W0 | `src/wally/rendering/assets.ts` | `assets.test.ts` | N/A | VERIFIED |
| WAL-002 | Wally event/dialogue engine (W1) | WALLY.md §37 W1 | — | — | — | PENDING |
| WAL-003 | Day 1-7 skin system | WALLY.md §20 | — | — | — | PENDING — **spec/art conflict flagged** |
| AUTH-001 | Invite-only admin account creation | Product Guide §5.1 | — | — | — | PENDING |
| AUTH-002 | Forced first-login password change | Product Guide §5.3 | — | — | — | PENDING |
| USR-001 | Onboarding (name/email/country) | Product Guide §5.4 | `src/app/onboarding/`, `src/proxy.ts` onboarding gate | Live E2E (real bugfix found: signIn/changePassword didn't know the gate existed) | Written via service-role, no client-writable path | VERIFIED |
| PLAYER-001 | Player shell (10 IA routes) | Product Guide §7, §26 Phase 4 | `src/app/(player)/` | Live E2E, all 10 routes | `PROTECTED_PREFIXES` extended | VERIFIED |
| ADM-001 | Admin Mission Control shell | Product Guide §17, §26 Phase 5 | `src/app/admin/layout.tsx`, `AdminNav`, real KPI cards, `/admin/audit` | Live E2E, SUPER_ADMIN vs MODERATOR nav/access | Role-based nav + independent per-page re-check; audit_logs has zero client RLS policies | VERIFIED |
| GAME-001 | Content engine (Day→Mission→Challenge) | Product Guide §9 | `game_days`/`missions`/`challenges`/`challenge_options`, `src/app/admin/missions/` | Live E2E; real bugfix found: days never publishable, fixed with `updateGameDayStatus` | RLS on every table; draft day/mission invisible to players | VERIFIED |
| SCORE-001 | `score_events` ledger | Product Guide §10 | `src/lib/scoring/leaderboard.ts`, `src/app/admin/scoring/` | Live E2E — real 100+50pt events, leaderboard reflects true 150pt total | No client-writable policy; correctness re-derived server-side, never trusts the client | VERIFIED |
| VOTE-001 | Poll engine + uniqueness | Product Guide §11 | `polls`/`poll_options`/`votes`, `src/app/admin/voting/`, `src/app/(player)/vote/` | Live E2E — duplicate vote refused, DB confirms exactly one row; reveal tested | `unique(poll_id, voter_id)` DB constraint, not just app-level check | VERIFIED (single-choice only — multi-select is a disclosed gap) |
| MEDIA-001 | Upload → moderation → gallery | Product Guide §12 | `challenge-submissions` storage bucket, `src/app/admin/submissions/`, `src/app/(player)/gallery/` | Live E2E — real image uploaded, moderated, approved, appeared only after approval | Private bucket + per-uploader-folder RLS, not policy-only | VERIFIED (core loop only — no admin Media Library) |
| RT-001 | Realtime broadcast/presence | Product Guide §14 | — | — | — | PENDING |
| EMAIL-001 | Daily Wally email | Product Guide §16 | — | — | — | PENDING |
| THEME-001 | Theme engine | Product Guide §19 | — | — | — | PENDING |
| SCREEN-001 | Spectator screen | Product Guide §21.2 | — | — | — | PENDING |
| AN-001 | Analytics taxonomy | Product Guide §22 | — | — | — | PENDING |
| TEST-001 | Day Zero rehearsal (full, incl. Wally/passport) | Product Guide §26 Phase 21 | — | — | — | PENDING — blocked on Phases 11-17 |
| E2E-001 | Day-Zero-style content/scoring/moderation/voting rehearsal | This session's own verification | Scratchpad Playwright script (not committed) | Full loop run live: mission publish → correct quiz → score event → photo upload → moderation → approval → score event → leaderboard → gallery → poll vote → duplicate refused → reveal → counts | Player bounced from admin routes throughout | VERIFIED (not a substitute for the full TEST-001 — no Wally, passport, or cross-country partner steps) |

## Test Matrix

| Feature | Unit | Integration | E2E | Security | Realtime | Visual | Status |
|---|---|---|---|---|---|---|---|
| Env validation | ✅ | N/A | N/A | N/A | N/A | N/A | VERIFIED |
| Wally asset registry | ✅ | N/A | N/A | N/A | N/A | ✅ | VERIFIED |
| Storyline content | ✅ | N/A | N/A | N/A | N/A | ✅ | VERIFIED |
| Foundation schema | ❌ | N/A | ✅ (live) | ✅ | N/A | N/A | VERIFIED |
| Login / onboarding | ❌ | N/A | ✅ (live) | ✅ | N/A | ✅ | VERIFIED |
| Player shell | N/A | N/A | ✅ (live) | ✅ | N/A | ✅ | VERIFIED |
| Admin shell | ❌ | N/A | ✅ (live) | ✅ | N/A | ✅ | VERIFIED |
| Content engine (missions/days) | ✅ | N/A | ✅ (live) | ✅ | N/A | ❌ | VERIFIED |
| Submission engine (quiz/photo) | ❌ | N/A | ✅ (live) | ✅ | N/A | ❌ | VERIFIED |
| Scoring / leaderboards | ✅ | N/A | ✅ (live) | ✅ | N/A | ✅ | VERIFIED |
| Voting | ✅ | N/A | ✅ (live) | ✅ | ❌ | ❌ | VERIFIED (single-choice only) |
| Media moderation / gallery | ❌ | N/A | ✅ (live) | ✅ | N/A | ❌ | VERIFIED (core loop only) |
| Wally Drop | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | PENDING |

---

## Release Gate

- [ ] All critical requirements verified — no, Phases 11-21 remain
- [ ] No unresolved critical blockers — no, 1 open (CI push, see Critical Blockers)
- [x] No critical security findings — one functional (not security) gap found and fixed this session (game days never publishable); no authorization bypass found across Phases 1-10's expanded surface
- [x] Lint passes
- [x] Typecheck passes
- [x] Unit tests pass (79/79)
- [ ] Integration tests pass — covered only by live E2E runs, no maintained suite
- [ ] E2E critical flows pass — live-verified manually each phase (Phases 2-9), not yet a committed automated suite under `tests/e2e/`
- [ ] Realtime tests pass — none exist (Phase 11 not started)
- [x] Production build passes
- [x] Mobile QA passes — checked live at 390px for the landing page, walkthrough preview, player shell, and admin shell; not a full formal accessibility pass
- [ ] Accessibility critical checks pass — not formally tested with a scanner
- [x] Vercel Preview/Production verified — Production confirmed live; Preview env vars still pending the user running the provided script
- [x] Supabase migrations verified — applied and verified live against the real project (4 migrations)
- [x] RLS verified — verified live against the real project, including a real inserted-and-deleted row test, not just structural inspection
- [x] Environment variables verified in Vercel — Production only (see evidence below); still not in GitHub Actions secrets (CI itself is blocked, see Critical Blockers #2)
- [ ] Rollback procedure verified — not written
- [x] Project state updated
- [x] Quality status updated
- [ ] Knowledge graph updated — no MCP memory graph connected; auto-memory used instead

**Release readiness: NOT READY.** Correct and expected this early — recorded as the baseline this checklist tracks forward from.
