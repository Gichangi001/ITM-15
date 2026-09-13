# ITM@15 Quality Status

_Last updated: 2026-09-13, Phase 4 (player shell) built and verified live end-to-end against the real project (see `docs/PROJECT_STATE.md`)._

| Gate | Status | Notes |
|---|---|---|
| Lint | **Pass** | `pnpm lint` (`eslint`, `eslint-config-next` core-web-vitals + typescript configs) — clean. |
| Typecheck | **Pass** | `pnpm typecheck` = `next typegen && tsc --noEmit`. Next.js 16's typed routes (`LayoutProps<"/">` etc.) require `next typegen` to run once before a bare `tsc` resolves them — folded into the script so this isn't a trap for the next session. Passes with the newly `Database`-typed Supabase clients and the new auth/onboarding code. |
| Unit tests | **Pass** | `pnpm test` (Vitest) — 9 test files, 51 tests, all passing. Adds `src/lib/auth/profile.test.ts` (3, `deriveFirstName`) and 5 new `onboardingSchema` cases in `schemas.test.ts` this session. |
| Integration tests | **Partial — covered by the live E2E pass below, not a separate integration-test suite.** No `tests/` directory or CI-runnable integration tests exist yet; Phase 2's server actions were verified by actually calling them through the real UI against the live database (see E2E row), not by a maintained automated suite a future session/CI can re-run on demand. Adding real `tests/integration/` coverage remains a gap. |
| RLS / database tests | **Pass — verified against the live project, 2026-09-13.** | Unchanged this session (no new migrations) — see the entry below for what Phase 1 verified. Phase 2 additionally exercised the `profiles`/`user_roles` "own row" RLS policies for real (not just structurally): every read in `src/lib/auth/session.ts` and `src/proxy.ts` goes through the RLS-scoped client and was proven, via live login as two different real accounts, to only ever return each account's own rows. All 4 migrations (`init_foundation`, `wally_w0_tables`, `fix_set_updated_at_search_path`, `add_missing_created_by_fk_indexes`) applied cleanly in sequence to `ysjjgzakswaohmnaowmv`. `get_advisors` clean except expected/non-actionable INFO findings (documented previously). |
| E2E tests | **Pass — live, manual (not yet a committed automated suite).** Phases 2-3 flows (see prior entries, unchanged) plus, this session, the full Phase 4 player shell against a synthetic fully-onboarded `shell.test@itm15.test` PLAYER account: sign-in lands on `/play`; all 10 player routes reachable with correct titles and no unexpected redirects; `/play/day/99` 404s; nav usable at mobile width; PLAYER still blocked from `/admin`; unauthenticated visit to a new protected route bounces to `/login`. Test account created via service-role key and deleted after verification. Scripts remain scratchpad-only, not committed to `tests/e2e/` — same disclosed gap as Phases 2-3. |
| Build | **Pass** | `pnpm build` (`next build`, Turbopack) — compiles, typechecks, prerenders `/`, `/_not-found`, `/first-login`, `/preview` as static; `/login`, `/play`, `/admin`, `/admin/players`, `/admin/players/new` are dynamic (server-rendered, as expected for auth-dependent routes). `ƒ Proxy (Middleware)` confirms `src/proxy.ts` is picked up. |
| Visual QA | **Not done for Phase 2's new pages.** Homepage/storyline/preview pages were screenshot-checked in earlier sessions (see below); the new `/login`, `/first-login`, `/admin/players/new`, `/admin/players` pages have not had a dedicated visual/mobile/accessibility pass — functionally verified via real form submission, not visually reviewed. Real gap to close before calling Phase 2 fully polished (functionally complete is not the same bar). |
| Security gate | **PASS** (`security-reviewer` subagent, isolated context) — no critical finding across authorization bypass, self-lockout/privilege-escalation, password handling, information disclosure, input validation, the disabled-account re-check, and audit-log coverage. One real Medium finding (redirect branches in `src/proxy.ts` dropped Supabase cookie mutations — session hygiene, not an authz bypass) fixed and empirically re-verified: disabled a real test account mid-session and confirmed its auth cookie is now genuinely cleared, not just left stale. See `docs/PROJECT_STATE.md`'s Phase 2 section for the full account. No secrets present in the repo or `.env.example`; `SUPABASE_SECRET_KEY` never appeared in any command output or committed file. |
| Preview/production deployment | **Pass** | `https://itm-15.vercel.app` — HTTP 200. Phase 2's new routes have not yet been verified against the Vercel deployment specifically (only against local `pnpm dev`) — the live Supabase project is the same one Vercel production points at, so this is a real gap: a push to `main` would deploy Phase 2 to production without it having been checked there first. |
| Load test | Not applicable | Far ahead of current phase (Phase 20 concern). |

## Tooling health

| Check | Result |
|---|---|
| `git status` | Clean tree pending this session's commit |
| Node.js | v26.0.0 |
| npm | 11.12.1 |
| corepack | **Installed this session** (`npm install -g corepack && corepack enable`) |
| pnpm | **12.4.1**, working; `esbuild` postinstall script approved via `pnpm approve-builds` (pnpm's supply-chain policy blocks unapproved postinstall scripts by default — legitimate here, required by Vitest) |
| gh CLI | Authenticated (`Gichangi001`) |
| Vercel CLI | v54.2.0, authenticated; `itm-15` project linked (`.vercel/`, gitignored) and confirmed Git-connected to this repo |
| Supabase connector | **Project-scoped `mcp__supabase__*` tools confirmed working this session** (`ToolSearch` + live calls against `ysjjgzakswaohmnaowmv`: `list_tables`, `apply_migration`, `get_advisors`, `generate_typescript_types`, `execute_sql` all exercised successfully). The account-level `mcp__claude_ai_Supabase__*` connector remains separately capped/scoped to `soko-ai` and is unrelated to this project. |
| `.mcp.json` | `supabase` now individually exercised and confirmed healthy (see above). `vercel`/`playwright`/`memory` still not individually auth-tested beyond the account-level connector calls made directly. |
| Project skills | 5/10 created |
| `.claude/settings.json` | Scoped permissions (allow/ask/deny) + `PreToolUse` hook, both created and hook directly tested this session |
| Docker | Not installed — blocks local Supabase dev stack (`supabase start`, `db lint`, `db reset`) |
| Prisma | `prisma`/`@prisma/client` 7.10.0 installed (pinned — `prisma`'s npm `latest` tag is currently an `8.0.0-rc` pre-release). `prisma version` runs correctly. Not yet functional: `DATABASE_URL`/`DIRECT_URL` need the real DB password; introspection-only per `docs/adr/0001-prisma-alongside-supabase-migrations.md` |

## Rule for future updates to this file

Never mark a gate green based on a prior commit after relevant code has changed. Record the exact commit SHA the result belongs to, and if a gate was skipped, say so explicitly rather than omitting the row.
