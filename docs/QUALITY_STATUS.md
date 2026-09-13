# ITM@15 Quality Status

_Last updated: 2026-09-13, Phase 1 (Supabase foundation) applied and verified against the live project (see `docs/PROJECT_STATE.md`)._

| Gate | Status | Notes |
|---|---|---|
| Lint | **Pass** | `pnpm lint` (`eslint`, `eslint-config-next` core-web-vitals + typescript configs) — clean. |
| Typecheck | **Pass** | `pnpm typecheck` = `next typegen && tsc --noEmit`. Next.js 16's typed routes (`LayoutProps<"/">` etc.) require `next typegen` to run once before a bare `tsc` resolves them — folded into the script so this isn't a trap for the next session. Passes with the newly `Database`-typed Supabase clients. |
| Unit tests | **Pass** | `pnpm test` (Vitest) — 6 test files, 16 tests, all passing. |
| Integration tests | Not applicable yet | No server actions/Supabase queries exist. |
| RLS / database tests | **Pass — verified against the live project, 2026-09-13.** | All 4 migrations (`init_foundation`, `wally_w0_tables`, `fix_set_updated_at_search_path`, `add_missing_created_by_fk_indexes`) applied cleanly in sequence to `ysjjgzakswaohmnaowmv` via `mcp__supabase__apply_migration`. `list_tables` confirms all 11 tables, RLS enabled on every one. Anon-key REST access verified empirically (not just structurally): a real row was inserted into `audit_logs` via the service-role path, confirmed invisible to a `curl` request using the actual anon publishable key (`200 []` despite the row genuinely existing), then deleted. The three `auth.uid()`-based "own row" policies (`profiles`, `user_roles`, `wally_event_receipts`) use the same well-established pattern; deliberately did not fabricate a synthetic `auth.users` row to test those further — that's covered naturally once Phase 2 creates real accounts. `get_advisors` run for both security and performance after applying: two real findings (mutable `search_path` on `set_updated_at`; two unindexed `created_by` FKs), both fixed with follow-up migrations and re-verified clean. Remaining advisor output is expected/non-actionable (one intentional deny-all-no-policy INFO on `audit_logs`; 13 "unused index" INFO findings on a schema with zero rows). |
| E2E tests | Not applicable yet | No Playwright config/tests yet; `playwright` MCP server is defined in `.mcp.json` but unexercised. |
| Build | **Pass** | `pnpm build` (`next build`, Turbopack) — compiles, typechecks, prerenders `/`, `/_not-found`, `/preview` as static. |
| Visual QA | **Partial pass** | Homepage/storyline page checked with Playwright screenshots at mobile (390×844) and desktop (1280×900), full-page (scrolled through in steps so IntersectionObserver reveals fire, matching real visitor behavior) — both clean, sent to the user. Caught and fixed two real bugs this way (see `PROJECT_STATE.md`): a lint-flagged synchronous `setState` in an effect, and an absolute-positioning bug from an unexpected CSS containing-block change. Not a full visual-QA pass (no empty/loading/error states on this one static page; no cross-browser check beyond Chromium). |
| Security gate | **Partial — database layer verified this session.** RLS/advisor review done for the newly-applied schema (see RLS row above). No auth/upload/realtime application surface exists yet to review — that's Phase 2+. No secrets present in the repo or in `.env.example` (names only); `SUPABASE_SECRET_KEY` never appeared in any command output or committed file this session. `.gitignore` covers `.env*`, `.vercel`, `.claude-memory/`. |
| Preview/production deployment | **Pass** | `https://itm-15.vercel.app` — HTTP 200, confirmed by curl to serve the real app (not the earlier 404). First deploy (commit `9e6c29f`) failed — project's Framework Preset was `Other`, causing a "No Output Directory named public" error despite `next build` succeeding. Fixed with `vercel.json` (`{"framework":"nextjs"}`, commit `309efc0`); redeployed clean. |
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
