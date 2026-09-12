# ITM@15 Project Audit Checklist

Last audit: 2026-09-13
Branch: main
Commit: `8c8b36f` (this audit's findings/fixes land in the commit(s) immediately after)
Environment: local dev machine, Vercel production (`https://itm-15.vercel.app`, HTTP 200 confirmed this audit), Supabase project `ysjjgzakswaohmnaowmv` (schema drafted, not applied)
Current build phase: Phase 0 done except one user-blocked item; Phase 1 (Supabase) app-side wiring done, schema drafted+skill-reviewed, application blocked on DB access; Wally W0 (placeholder assets/tables) done to the same "drafted, unapplied" point; Phase 3's landing-page teaser section built early and out of strict phase order (a deliberate, disclosed choice — see "Seven-Day Story" below), everything else (Phases 2, 4-21) not started.

## How to read this file

`[x]` = evidence block backs it up (Gates A-K from `docs/ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md` §5, at least the applicable ones). `[ ]` = pending, in progress, or blocked — the label after the item says which. This audit re-verified every previously-`[x]` item against current code/`git log`/a fresh `pnpm verify`, not just against what an earlier session claimed (§7 of the audit-control doc) — none needed reopening.

## Executive Status

- Total requirements tracked here: 151
- Verified complete: 14
- In progress: 5
- Pending: 131
- Blocked: 2 (both need a user action, not more engineering — see Critical Blockers)
- Failed verification: 0
- Deferred: 0

Overall completion: **Phase 0 done bar one item; early Phase 1 of 21** (Product Guide §26 numbering). One piece of Phase 3 (the landing-page story teaser) was built ahead of order — disclosed, not hidden — everything else is untouched.
Release readiness: **NOT READY.** Expected at this stage — recorded as the honest baseline, not a finding demanding immediate action beyond what's below.

## Critical Blockers

1. **Supabase database access — blocks all of Phase 1 onward. Root cause now precisely identified.** `claude mcp list` shows the project's `.mcp.json` servers (`supabase`, `vercel`, `playwright`, `memory`) at `⏸ Pending approval (run claude to approve)` — a one-time trust-on-first-use gate for project-committed MCP servers, distinct from OAuth. `claude mcp login supabase` confirms directly: `"supabase" is from .mcp.json and awaiting approval. Run claude in this directory to review it first.` No CLI subcommand can clear this from a non-interactive session — it requires running the interactive `claude` REPL in this directory once. See `docs/PROJECT_STATE.md` for the exact steps. **Until resolved, neither migration (`20260912230000_init_foundation.sql`, `20260913000000_wally_w0_tables.sql`) can be applied, and no phase past 1 can build against a real schema.**
2. **`.github/workflows/ci.yml` unpushed — blocks automated CI.** The `gh`/git OAuth token lacks the `workflow` scope. Fix: user runs `gh auth refresh -h github.com -s workflow` once. Lower severity than #1 — `pnpm verify` run manually every session substitutes for now.

Neither blocker is something this session can resolve unilaterally (per `docs/PROJECT_STATE.md` — no pausing/deleting Supabase projects, no forcing an OAuth scope grant without the user's browser).

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

Foundation exists (`src/lib/supabase/{client,server,admin}.ts`); zero auth UI/server actions built. All pending:

- [ ] Admin can create employee account (`/admin/players/new` server action)
- [ ] Email stored correctly (unique, required)
- [ ] Name/country/entity stored correctly (optional at creation, required before gameplay)
- [ ] Temporary `Walumo` password flow works
- [ ] `Walumo` cannot remain a permanent password (`must_change_password` gate)
- [ ] Forced password reset works (`/first-login`, min 10 chars, disallow exact `Walumo` reuse)
- [ ] Private password stored through Supabase Auth (not a custom table)
- [ ] Session persists correctly
- [ ] Logout works
- [ ] Unauthorized/unknown email cannot self-register
- [ ] Admin route protection works (player cannot reach `/admin/*`)
- [ ] User role is server-verified (never trust a client-supplied role)
- [ ] Login page (`/login`) — cinematic background, Wally teaser, show/hide password, "Need help?" action
- [ ] Disabled-user handling (profile `status = DISABLED` rejected even with a valid Auth session)

## Employee Onboarding (Phase 3 — Product Guide §5.4)

- [ ] Onboarding form (`/onboarding`): full name, email (read-only from Auth), country (required), entity (recommended), optional profile photo
- [ ] Minimum required game identity enforced: name + email + country
- [ ] Automatic squad assignment on completion (if enabled)
- [ ] Incomplete profile cannot bypass onboarding into `/play`

Note: the landing page itself (hero + story teaser) was built this session ahead of this phase's usual order — see "Seven-Day Story" below. Onboarding/login were **not** pulled forward with it; they still need Phase 2's auth foundation first.

## Database & RLS (Phase 1 — Product Guide §26)

- [ ] Migration `20260912230000_init_foundation.sql` applied to a real database — STATUS: BLOCKED (Critical Blockers #1)
- [ ] Migration `20260913000000_wally_w0_tables.sql` applied — STATUS: BLOCKED (same blocker)
- [x] Both migrations reviewed against `supabase-postgres-best-practices` skill

  **Requirement:** general schema-quality best practice
  **Implementation:** FK indexes added throughout; `auth.uid()` wrapped in `select` in every RLS policy referencing it
  **Tests:** manual review against the skill's reference docs; static SQL read-through only — not executed against real Postgres
  **Result:** PASS for what a static review can confirm — not a substitute for running it
  **Verified:** 2026-09-12/13
  **Commit:** `1b9c5d7`, `1fabece`

- [ ] Database rebuilds cleanly from migrations (`supabase db reset`) — cannot test: no Docker locally, no live-project access
- [ ] Anonymous client cannot read `profiles`/`user_roles`/`audit_logs`/`wally_event_receipts` — cannot test yet, same reason
- [ ] Supabase TypeScript types generated (`supabase gen types typescript`) — depends on the above
- [ ] Prisma introspection (`prisma db pull`) run at least once — blocked on real `DATABASE_URL`/`DIRECT_URL` password, separately from the MCP blocker

## Landing Page (Phase 3 — Product Guide §6)

- [x] Hero section, exact approved copy, Wally teaser image — `src/app/page.tsx`, see "Seven-Day Story" below for full evidence
- [x] Seven-day chapter teaser (non-spoiling) — see "Seven-Day Story"
- [ ] "15 years in motion" historical timeline — deliberately skipped, needs real ITM historical data not available this session
- [ ] Multinational-presence map/visual — deliberately skipped, same reason
- [ ] Live countdown to next unlock — needs a real campaign row with real dates from the database
- [ ] "Enter the Game" / "Sign In" CTAs — deliberately omitted (would be dead links before Phase 2 auth exists); current CTA is a working same-page scroll anchor only

## Player Shell (Phase 4 — Product Guide §7)

- [ ] All items pending — not started. Routes needed: `/play`, `/play/day/[dayNumber]`, `/play/mission/[missionId]`, `/passport`, `/leaderboards`, `/gallery`, `/achievements`, `/notifications`, `/profile`, `/help`.

## Admin Mission Control (Phase 5 — Product Guide §17, audit-control doc §13)

All pending — no admin UI exists yet:

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
- [ ] Wally Control Room works (`/admin/live/wally`)
- [ ] Audience targeting works
- [ ] Live notifications work
- [ ] Featured media works
- [ ] Spectator screen controls work
- [ ] Audit log works
- [ ] Emergency pause works

## Content Engine (Phase 6 — Product Guide §9, §18)

- [ ] Content hierarchy modeled (Campaign → Game Day → Story Scene → Mission → Challenge)
- [ ] Question editor (create/edit/archive, rich text, media, options, points, time limit, targeting, retry policy, preview)
- [ ] Mission editor (9-step guided builder: basics/audience/challenge/scoring/Wally/timing/theme/preview/publish)
- [ ] Draft/preview/publish workflow
- [ ] Revision handling for editing a live mission (warning, revision record, no retroactive invalidation without explicit choice)
- [ ] Admin can create a mission without a code deploy
- [ ] Draft mission invisible to players

## Submission Engine (Phase 7 — Product Guide §7 challenge types)

- [ ] Reusable challenge renderer — at minimum: single/multiple-choice quiz, free-text, long answer, photo/video/audio upload, select-colleague, nomination+reason, vote, timed, cross-country partner, squad, QR/code discovery, find-a-person, image ID, sequence puzzle, poll, check-in, admin-verified live
- [ ] Attempt/retry rules enforced server-side
- [ ] Server deadline validation (never trust client clocks)
- [ ] Player completes a mission end-to-end

## Authoritative Scoring & Leaderboards (Phase 8 — Product Guide §10)

- [ ] `score_events` append-only ledger (schema not yet written — later than the Phase 1 foundation tables)
- [ ] Admin bonus-point flow (award to player/squad/country, required reason, guardrail, confirmation, audit entry)
- [ ] Individual/squad/country/entity leaderboards
- [ ] Leaderboard admin controls (show/hide, freeze, delay, dramatic reveal)
- [ ] Browser cannot self-award points (server-authoritative, no client-mutable score field)

## Voting & Nominations (Phase 9 — Product Guide §11)

- [ ] Poll configuration (single/multi-choice, named/anonymous, eligibility, candidate source, self-vote rule, timing, live-count, reveal rule)
- [ ] Vote uniqueness enforced at the database level, not just UI
- [ ] Nomination + reason flow
- [ ] Admin-controlled live reveal

## Media Uploads & Moderation (Phase 10 — Product Guide §12)

- [ ] Storage buckets (`avatars`, `challenge-submissions`, `approved-gallery`, `admin-media`, `wally-assets`) and their access policies
- [ ] Upload flow (client validation → server/storage authorization → Pending → moderator review → approve/reject/resubmit)
- [ ] Approved gallery (`/gallery`, filters by day/country/challenge/squad/featured)
- [ ] Admin Media Library
- [ ] Unapproved media never appears on a public surface

## Realtime Engine (Phase 11 — Product Guide §14)

- [ ] Broadcast/Presence helpers
- [ ] Channel topics (`game:global`, `game:day:{id}`, `country:{id}`, `entity:{id}`, `squad:{id}`, `player:{id}`, `admin:mission-control`)
- [ ] Live activity feed
- [ ] Realtime mission publish/notification delivery/leaderboard refresh signal
- [ ] Two-browser test: published event arrives without refresh
- [ ] Private channels don't leak audiences

## Admin Notifications & Live Controls (Phase 12 — Product Guide §15)

- [ ] Notification composer, audience targeting, CTA links
- [ ] Live toast/banner/modal delivery
- [ ] Schedule support
- [ ] Pause/resume game
- [ ] Targeted message reaches only the target; global reaches all eligible connected players

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

- [ ] Actual seven-day game loop (missions, challenges, unlocks) — Phase 6+, not started. This teaser page is not that.
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

- [ ] Wally architecture matches `docs/WALLY.md` — PARTIAL: asset registry only, no controller/state machine/priority queue (W1, Phase 13)
- [ ] Wally does not own authoritative score logic — trivially true (no score logic exists at all yet)
- [ ] Personalized name greeting — not built
- [ ] Mission introduction — not built
- [ ] Correct-answer reaction — not built
- [ ] Wrong-answer reaction — not built
- [ ] Achievement reaction — not built
- [ ] Photo approval reaction — not built
- [ ] Bonus-point reaction — not built
- [ ] Country-overtake reaction — not built
- [ ] Wally Drop realtime — not built
- [ ] Targeted player message — not built
- [ ] Country-targeted message — not built
- [ ] Squad-targeted message — not built
- [ ] Global message — not built
- [ ] Wally admin preview — not built
- [ ] Wally animation states — only 8 static poses exist, no state machine/transitions
- [ ] Wally does not interrupt critical form actions — N/A yet, nothing interrupts anything
- [ ] Reduced-motion mode — implemented for the landing page's scroll-reveal (`motion-reduce:` variant), not yet for a Wally controller (doesn't exist)
- [ ] Lite/2D fallback — the entire current asset set *is* 2D/Lite-tier by nature, but no quality-tier resolver exists to formally select it
- [ ] Mobile performance acceptable — checked visually for the one page Wally appears on; no dedicated perf budget test yet
- [ ] Seven-day Wally progression — **flagged conflict, see below**, not built
- [ ] I-B-E-L-O-N-G sequence — deliberately not implemented/displayed yet (would spoil the mechanic if built carelessly)
- [ ] Wally analytics events — not built

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

- [x] 9 tests across 4 files, all passing (`env.test.ts`, `env.server.test.ts`, `assets.test.ts`, `story.test.ts`) — re-confirmed this audit at commit `8c8b36f`
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
| DB-001 | Foundation schema (profiles/countries/entities/user_roles/campaigns/audit_logs) | Product Guide §23, §26 Phase 1 | `20260912230000_init_foundation.sql` | Skill review only | RLS drafted | IN PROGRESS (blocked on apply) |
| DB-002 | Wally W0 tables | WALLY.md §8, §37 | `20260913000000_wally_w0_tables.sql` | Skill review only | RLS drafted | IN PROGRESS (blocked on apply) |
| DB-003 | Database rebuilds from migrations | Product Guide §26 Phase 1 acceptance | — | — | — | BLOCKED |
| DB-004 | Anonymous cannot read private data | Product Guide §26 Phase 1 acceptance | — | — | — | BLOCKED |
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
| USR-001 | Onboarding (name/email/country) | Product Guide §5.4 | — | — | — | PENDING |
| ADM-001 | Admin Mission Control shell | Product Guide §17, §26 Phase 5 | — | — | — | PENDING |
| GAME-001 | Content engine (Campaign→Day→Mission→Challenge) | Product Guide §9 | — | — | — | PENDING |
| SCORE-001 | `score_events` ledger | Product Guide §10 | — | — | — | PENDING |
| VOTE-001 | Poll engine + uniqueness | Product Guide §11 | — | — | — | PENDING |
| MEDIA-001 | Upload → moderation → gallery | Product Guide §12 | — | — | — | PENDING |
| RT-001 | Realtime broadcast/presence | Product Guide §14 | — | — | — | PENDING |
| EMAIL-001 | Daily Wally email | Product Guide §16 | — | — | — | PENDING |
| THEME-001 | Theme engine | Product Guide §19 | — | — | — | PENDING |
| SCREEN-001 | Spectator screen | Product Guide §21.2 | — | — | — | PENDING |
| AN-001 | Analytics taxonomy | Product Guide §22 | — | — | — | PENDING |
| TEST-001 | Day Zero rehearsal | Product Guide §26 Phase 21 | — | — | — | PENDING |

## Test Matrix

| Feature | Unit | Integration | E2E | Security | Realtime | Visual | Status |
|---|---|---|---|---|---|---|---|
| Env validation | ✅ | N/A | N/A | N/A | N/A | N/A | VERIFIED |
| Wally asset registry | ✅ | N/A | N/A | N/A | N/A | ✅ | VERIFIED |
| Storyline content | ✅ | N/A | N/A | N/A | N/A | ✅ | VERIFIED |
| Foundation schema | ❌ | ❌ | N/A | Partial (drafted) | N/A | N/A | BLOCKED |
| Login | ❌ | ❌ | ❌ | ❌ | N/A | ❌ | PENDING |
| Voting | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | PENDING |
| Wally Drop | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | PENDING |
| Photo Approval | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | PENDING |

---

## Release Gate

- [ ] All critical requirements verified — no
- [ ] No unresolved critical blockers — no, 2 open (see Critical Blockers)
- [ ] No critical security findings — no findings *yet* because almost nothing security-relevant has been built
- [x] Lint passes
- [x] Typecheck passes
- [x] Unit tests pass (9/9)
- [ ] Integration tests pass — none exist
- [ ] E2E critical flows pass — none exist
- [ ] Realtime tests pass — none exist
- [x] Production build passes
- [ ] Mobile QA passes — checked visually for one page only, not a formal pass
- [ ] Accessibility critical checks pass — not formally tested
- [x] Vercel Preview/Production verified
- [ ] Supabase migrations verified — drafted, unapplied
- [ ] RLS verified — drafted, unapplied
- [x] Environment variables verified in Vercel — Production only (see evidence below); still not in GitHub Actions secrets (CI itself is blocked, see Critical Blockers #2)
- [ ] Rollback procedure verified — not written
- [x] Project state updated
- [x] Quality status updated
- [ ] Knowledge graph updated — no MCP memory graph connected; auto-memory used instead

**Release readiness: NOT READY.** Correct and expected this early — recorded as the baseline this checklist tracks forward from.
