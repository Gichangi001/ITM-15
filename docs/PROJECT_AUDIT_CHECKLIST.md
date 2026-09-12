# ITM@15 Project Audit Checklist

Last audit: 2026-09-12
Branch: main
Commit: (pending — this file is committed alongside `c3ac493`, see `git log` for the exact HEAD at audit time)
Environment: local dev machine, Vercel production (`https://itm-15.vercel.app`), Supabase project `ysjjgzakswaohmnaowmv` (schema not yet applied)
Current build phase: Phase 0 (repository/quality foundation) essentially done; Phase 1 (Supabase foundation) app-side wiring done, schema drafted but unapplied

This is a first seed of this checklist (the file itself was added to the repo by the user this session, at `docs/ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md`). It reflects real, currently-verifiable state only — most feature rows are `[ ]` because no application feature code exists yet beyond the placeholder homepage and the Supabase client foundation. A full traceability-matrix pass (§9 of the audit-control doc) is future work, not done in this seed.

## Executive Status

- Total requirements tracked here: 81
- Verified complete: 9
- In progress: 4
- Pending: 68
- Blocked: 0 (both prior blockers — Supabase project existence, Vercel linkage — are resolved; two smaller items need a user action, tracked in `docs/PROJECT_STATE.md`, not blocking further work)
- Failed verification: 0
- Deferred: 0

Overall completion: **early Phase 1 of 21** (Product Guide §26 phase numbering).
Release readiness: **NOT READY** — nowhere close; this is expected at this stage, not a finding.

## Critical Blockers

- [ ] None currently block *this session's* work. Two items need a user action before Phase 1 can finish (not blocking Phase 0 foundation work): see `docs/PROJECT_STATE.md` — (1) authenticate the project-scoped Supabase MCP or supply the DB password so the draft migration can be applied to `ysjjgzakswaohmnaowmv`; (2) an explicit decision on whether Prisma is added alongside the existing `supabase/migrations` approach.

## Foundation & Repository

- [x] Repository documentation correctly located (`docs/PRODUCT_GUIDE.md`, `docs/WALLY.md`, `CLAUDE.md` at root)

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §1, `docs/WALLY.md` §0
  **Implementation:** `git mv` in commit `67f425b`; duplicate re-uploads removed in `632f720`
  **Tests:** N/A (structural)
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `632f720`

- [x] Next.js + TypeScript + Tailwind application scaffolded

  **Requirement:** Product Guide §3, §26 Phase 0
  **Implementation:** `package.json`, `src/app/`, `tsconfig.json`, `next.config.ts`
  **Tests:** `pnpm build` succeeds
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `9e6c29f`

- [x] Production build passes (lint + typecheck + test + build)

  **Requirement:** `CLAUDE.md` "Required quality gate"
  **Implementation:** `pnpm verify` script
  **Tests:** `pnpm verify` — see `docs/QUALITY_STATUS.md`
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `c3ac493`

- [x] Vercel production deployment live

  **Requirement:** Product Guide §26 Phase 0 acceptance
  **Implementation:** `vercel.json` (framework override), Git-connected `itm-15` project
  **Tests:** `curl -o /dev/null -w '%{http_code}' https://itm-15.vercel.app` → 200
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `309efc0`

- [ ] GitHub Actions CI running — STATUS: BLOCKED

  Blocker: `gh`/git OAuth token lacks the `workflow` scope; GitHub rejects pushes touching `.github/workflows/*`.
  Impact: no automated lint/typecheck/test/build on PRs yet; all verification is manual (`pnpm verify`) this session.
  Required resolution: user runs `gh auth refresh -h github.com -s workflow`, then the already-written `.github/workflows/ci.yml` can be pushed.
  Owner/dependency: user (interactive, opens a browser).

- [ ] `.claude/agents/` project agents created (architecture/security/database/test/ux/wally reviewers)

## Tooling & Claude Environment

- [x] Environment capability inventory current (`docs/claude/ENVIRONMENT_INVENTORY.md`)

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §2.2
  **Implementation:** `docs/claude/ENVIRONMENT_INVENTORY.md`
  **Tests:** N/A
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `c3ac493`

- [x] Project-scoped `.claude/settings.json` (permissions) + destructive-command hook

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §9.1–9.3
  **Implementation:** `.claude/settings.json`, `.claude/hooks/check-destructive-command.sh`
  **Tests:** manually piped 4 sample dangerous payloads (blocked) + 1 safe payload (allowed)
  **Security:** this *is* a security control
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `cb639c9`

- [ ] 5/10 recommended project skills created — STATUS: IN PROGRESS (`project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate` done; `supabase-review`, `test-gate`, `visual-qa`, `wally-qa`, `release-gate` deliberately deferred until there's an artifact each would review)
- [ ] Official Supabase agent skills installed (`supabase`, `supabase-postgres-best-practices` — done, commit `c3ac493`) — marked in-progress only because the broader skills recommendation isn't fully closed out above
- [ ] `.mcp.json` servers authenticated — STATUS: IN PROGRESS (defined: `vercel`, `supabase` (rescoped to `project_ref=ysjjgzakswaohmnaowmv`), `playwright`, `memory`; none confirmed authenticated via an actual `/mcp` check yet)
- [ ] Memory knowledge-graph MCP exercised (defined in `.mcp.json`, never invoked)
- [ ] Secret-scan pre-commit hook (runbook §9.4) — not created

## Documentation

- [x] `docs/DOCS_INDEX.md`, `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md` current

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §10, this document §1
  **Implementation:** all three files, updated each session
  **Tests:** N/A
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `c3ac493`

- [x] `docs/adr/` populated — `0001-prisma-alongside-supabase-migrations.md`

  **Requirement:** `ITM15_MASTER_BUILD_RUNBOOK.md` §40 (ADRs for decisions worth remembering)
  **Implementation:** `docs/adr/0001-prisma-alongside-supabase-migrations.md`
  **Tests:** N/A
  **Security:** documents the RLS-vs-Prisma-migrations risk explicitly
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** (pending, see git log)
- [ ] This checklist (`docs/PROJECT_AUDIT_CHECKLIST.md`) kept current — STATUS: IN PROGRESS (seeded this session; full traceability matrix per §9 not yet built)

## Authentication & User Management

- [ ] Admin can create employee account
- [ ] Email/name/country/entity stored correctly
- [ ] Temporary `Walumo` password flow works
- [ ] `Walumo` cannot remain a permanent password
- [ ] Forced password reset works
- [ ] Session persists correctly
- [ ] Logout works
- [ ] Unauthorized route protection works
- [ ] Admin route protection works
- [ ] User role is server-verified

(All pending — Phase 2 has not started. `src/lib/supabase/{client,server,admin}.ts` exist and are the foundation this phase will build on, but no auth UI or server actions exist yet.)

## Employee Onboarding

- [ ] All items pending — Phase 3, not started.

## Database & RLS

- [ ] Migration `20260912230000_init_foundation.sql` applied to a real database — STATUS: BLOCKED

  Blocker: this session cannot reach the live `ysjjgzakswaohmnaowmv` project — the user reports having run `claude /mcp` to authenticate the project-scoped Supabase MCP server, but `~/.claude.json`'s project entry shows zero registered MCP servers and no new Supabase tools became available (checked twice).
  Impact: Phase 1 cannot be marked complete; no downstream phase can build real auth/game features against a live schema.
  Required resolution: confirm `/mcp` was run in the same terminal running this session; if so, restart `claude` in this repo to load the project-scoped `.mcp.json` server added mid-session.
  Owner/dependency: user (interactive step, outside this session's reach).

- [x] Migration reviewed against `supabase-postgres-best-practices` skill

  **Requirement:** general schema-quality best practice, not a specific Product Guide item
  **Implementation:** `supabase/migrations/20260912230000_init_foundation.sql` — added FK indexes (`entities.country_id`, `profiles.country_id`/`entity_id`, `user_roles.country_id`, `audit_logs.actor_id`); wrapped `auth.uid()` in `select` in both RLS policies
  **Tests:** manual review against `.agents/skills/supabase-postgres-best-practices/references/schema-foreign-key-indexes.md` and `security-rls-performance.md`; static SQL read-through (still not executed against a real Postgres)
  **Security:** the RLS-performance fix is also a correctness improvement (unwrapped `auth.uid()` still worked, just slower)
  **Result:** PASS (for what a static review can confirm — not a substitute for Gate D against a live database)
  **Verified:** 2026-09-12
  **Commit:** (pending, see git log)

- [ ] Database rebuilds cleanly from migrations (`supabase db reset` or equivalent) — cannot test: no Docker locally, no CLI link to the live project yet
- [ ] Anonymous client cannot read `profiles`/`user_roles`/`audit_logs` — cannot test yet, same reason
- [ ] Supabase TypeScript types generated (`supabase gen types typescript`) — not done, depends on the above
- [ ] Countries/entities/campaigns readable by anon (by design, per migration) — implemented, unverified against a live database

## Admin Mission Control

- [ ] All items pending — Phase 5+, not started.

## Seven-Day Story

- [x] Public storyline teaser (landing page)

  **Requirement:** `docs/PRODUCT_GUIDE.md` §6.1 (hero copy), §6.2 ("teaser of seven locked chapters without spoiling missions"), §8 (day titles/themes)
  **Implementation:** `src/app/page.tsx`, `src/content/story.ts`, `src/components/RevealOnScroll.tsx`, font/token setup in `src/app/layout.tsx` and `globals.css`
  **Tests:** `src/content/story.test.ts` (2 tests); `pnpm verify` green; Playwright full-page screenshots (scrolled through in steps) at mobile and desktop, sent to the user
  **Security:** N/A — static public content, no auth/data dependency
  **Result:** PASS for what this is (a marketing teaser, not the interactive game). Two bugs found via screenshot review and fixed before this was marked done: a lint-flagged sync `setState` in an effect, and an absolute-positioning bug from a CSS containing-block change caused by a sibling `transform`.
  **Verified:** 2026-09-13
  **Commit:** (pending, see git log)
  **Known limitations:** no "15 years in motion" historical timeline or multinational-presence map (§6.2) — would require real ITM historical/office data not available this session, and inventing specific company history was judged too risky; no live countdown (needs a real campaign start date from the database); no "Enter the Game"/"Sign In" CTAs (would be dead links before Phase 2 auth exists).

- [ ] Actual seven-day game loop (missions, challenges, unlocks) — pending, Phase 6+, not started. This teaser page is not that.

## Game Engine / Missions & Challenges / Scoring & Unity Points / Voting / Photos & Media / Realtime / Country & Squad Features / Passport & Achievements / Leaderboards / Notifications / Daily Wally Email / Theme Engine / Spectator-Event Screen / Analytics

- [ ] All items pending — later phases, not started. Not enumerated line-by-line in this seed to avoid a wall of identical `[ ]` entries; see `docs/PRODUCT_GUIDE.md` §26 for the full phase list and `ITM15_MASTER_BUILD_RUNBOOK.md` §17 for the tooling mapped to each. Expand this section into the full item-by-item form (per the audit-control doc's §13–§16 templates) when each phase actually starts.

## Wally

- [ ] All 23 items in the audit-control document's §12 Wally checklist — pending. `docs/WALLY.md` fully read; no Wally behaviour/controller/event engine exists yet (Phase 13+).
- [x] W0 placeholder asset registry (docs/WALLY.md §37)

  **Requirement:** `docs/WALLY.md` §37 W0 — "placeholder Wally asset registry"
  **Implementation:** `src/wally/rendering/assets.ts` (8 poses from user-supplied `MASCOTTE.zip`, optimized with `sharp`), `supabase/migrations/20260913000000_wally_w0_tables.sql` (5 Wally tables), `supabase/seed.sql` (asset rows)
  **Tests:** `src/wally/rendering/assets.test.ts` (2 tests); `pnpm verify` green; Playwright screenshots at mobile/desktop confirming the `open-arms` pose renders correctly on the homepage
  **Security:** RLS enabled on all 5 new tables, reviewed against `supabase-postgres-best-practices` skill; migration itself still unapplied to any real database (same caveat as the Phase 1 migration)
  **Result:** PASS for what exists (static registry + one page wiring); the Supabase tables remain unverified against a live database
  **Verified:** 2026-09-13
  **Commit:** (pending, see git log)
  **Known limitations:** spec-vs-art conflict flagged, not resolved — see `docs/PROJECT_STATE.md`. Assets served from Next.js `public/`, not Supabase Storage's `wally-assets` bucket, pending the same DB access blocker.

## Accessibility / Performance

- [ ] Not applicable yet — no user-facing feature surface beyond one static placeholder page.

## Security

- [x] Secrets excluded from Git

  **Requirement:** audit-control doc §11, `CLAUDE.md`
  **Implementation:** `.env.local` (real Supabase keys) confirmed gitignored via `git check-ignore`; `grep`-confirmed the secret key does not appear in `.next` build output
  **Tests:** manual grep/check-ignore this session
  **Security:** this is the security check
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `c3ac493`

- [ ] Secrets excluded from Claude memory / knowledge graph — believed true (no secret values were written to any memory file this session), not independently re-audited against historical memory content
- [ ] Service-role key absent from client bundle — verified once (see above) for the current build; must be re-verified whenever `admin.ts` usage expands
- [ ] All other §11 security checklist items — pending (RLS enforcement untested against a live DB, no admin/scoring/voting code exists yet)

## Unit Tests

- [x] `src/lib/env.ts` / `src/lib/env.server.ts` validated with synthetic values

  **Requirement:** Product Guide §31 (env validation)
  **Implementation:** `src/lib/env.test.ts`, `src/lib/env.server.test.ts`
  **Tests:** `pnpm test` — 2 files, 5 tests, all passing
  **Security:** N/A
  **Result:** PASS
  **Verified:** 2026-09-12
  **Commit:** `c3ac493`

- [ ] All other unit test coverage — pending (no business logic exists yet to test)

## Integration / E2E / Realtime Tests

- [ ] Not started — no Playwright config, no `tests/e2e/` directory, nothing to exercise yet.

## Visual QA

- [ ] Not started for the one real page (placeholder homepage) — low priority until Phase 3's actual landing page exists.

## Production Build

- [x] See "Foundation & Repository" above — PASS, commit `c3ac493`.

## Vercel Preview

- [x] See "Foundation & Repository" above (production; no feature branch preview exercised yet since all work has landed on `main` directly this early in the project) — PASS, commit `309efc0`.

## Production Readiness

- [ ] Not applicable — far too early; see Release Gate below.

## Documentation & Memory

- [x] `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md`, `docs/DOCS_INDEX.md`, `docs/claude/ENVIRONMENT_INVENTORY.md`, this file — all updated this session.
- [x] Auto-memory (`project_itm15_walumo.md`) updated this session, no secrets written.

## Deferred Items

- None yet. (5 project skills and 6 project agents are *not yet created*, tracked above as pending/in-progress, not deferred — the runbook expects them, just not before the phase that needs them.)

---

## Release Gate

- [ ] All critical requirements verified — no
- [ ] No unresolved critical blockers — yes (see note above; two user-actionable items remain, neither blocking)
- [ ] No critical security findings — no findings *yet* because almost nothing security-relevant has been built
- [x] Lint passes
- [x] Typecheck passes
- [x] Unit tests pass
- [ ] Integration tests pass — none exist
- [ ] E2E critical flows pass — none exist
- [ ] Realtime tests pass — none exist
- [x] Production build passes
- [ ] Mobile QA passes — not tested
- [ ] Accessibility critical checks pass — not tested
- [x] Vercel Preview/Production verified
- [ ] Supabase migrations verified — drafted, unapplied
- [ ] RLS verified — drafted, unapplied
- [ ] Environment variables verified — present locally (`.env.local`); not yet configured in Vercel's dashboard or as GitHub Actions secrets
- [ ] Rollback procedure verified — not written
- [x] Project state updated
- [x] Quality status updated
- [ ] Knowledge graph updated — no MCP memory graph connected yet; auto-memory used instead

**Release readiness: NOT READY.** This is the expected, correct state at Phase 0/1 — recorded here as the honest baseline this checklist will track forward from, not a finding requiring immediate action beyond what's already listed in `docs/PROJECT_STATE.md`.
