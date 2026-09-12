# ITM@15 Quality Status

_Last updated: 2026-09-12, Phase 0 application-scaffolding session, on top of commit `67f425b` (uncommitted at time of writing — see `docs/PROJECT_STATE.md`)._

| Gate | Status | Notes |
|---|---|---|
| Lint | **Pass** | `pnpm lint` (`eslint`, `eslint-config-next` core-web-vitals + typescript configs) — clean. |
| Typecheck | **Pass** | `pnpm typecheck` = `next typegen && tsc --noEmit`. Next.js 16's typed routes (`LayoutProps<"/">` etc.) require `next typegen` to run once before a bare `tsc` resolves them — folded into the script so this isn't a trap for the next session. |
| Unit tests | **Pass** | `pnpm test` (Vitest) — 2 test files, 5 tests (`src/lib/env.test.ts`, `src/lib/env.server.test.ts`), all passing, all using synthetic fake values (not real secrets — see `PROJECT_STATE.md` for why). |
| Integration tests | Not applicable yet | No server actions/Supabase queries exist. |
| RLS / database tests | **Not run — cannot run yet** | `supabase/migrations/20260912230000_init_foundation.sql` drafted and skill-reviewed (FK indexes added, `auth.uid()` wrapped in `select` per Supabase's RLS performance guidance) but still unverified against a real database: no Docker on this machine, and this session still cannot reach the live `ysjjgzakswaohmnaowmv` project (project-scoped MCP auth hasn't registered in this session despite the user reportedly running `claude /mcp` — see `PROJECT_STATE.md`). Do not treat this migration as tested; the skill review improves confidence in the SQL, it does not substitute for running it. |
| E2E tests | Not applicable yet | No Playwright config/tests yet; `playwright` MCP server is defined in `.mcp.json` but unexercised. |
| Build | **Pass** | `pnpm build` (`next build`, Turbopack) — compiles, typechecks, prerenders `/` and `/_not-found` as static. |
| Visual QA | Not run | Only page is an intentional placeholder (`src/app/page.tsx`) — nothing to visually QA yet beyond "does it render," confirmed by the build succeeding. |
| Security gate | Not run | No auth/RLS/upload/realtime surface exists yet to review. No secrets present in the repo or in `.env.example` (names only). `.gitignore` covers `.env*`, `.vercel`, `.claude-memory/`. |
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
| Supabase connector | Authenticated; **project creation blocked** — account is at the 2-project free-tier cap across all orgs where it's admin/owner (see `PROJECT_STATE.md` blocker 3) |
| `.mcp.json` | `vercel`, `supabase`, `playwright`, `memory` — still not individually auth-tested/exercised beyond the account-level connector calls made directly |
| Project skills | 5/10 created |
| `.claude/settings.json` | Scoped permissions (allow/ask/deny) + `PreToolUse` hook, both created and hook directly tested this session |
| Docker | Not installed — blocks local Supabase dev stack (`supabase start`, `db lint`, `db reset`) |
| Prisma | `prisma`/`@prisma/client` 7.10.0 installed (pinned — `prisma`'s npm `latest` tag is currently an `8.0.0-rc` pre-release). `prisma version` runs correctly. Not yet functional: `DATABASE_URL`/`DIRECT_URL` need the real DB password; introspection-only per `docs/adr/0001-prisma-alongside-supabase-migrations.md` |

## Rule for future updates to this file

Never mark a gate green based on a prior commit after relevant code has changed. Record the exact commit SHA the result belongs to, and if a gate was skipped, say so explicitly rather than omitting the row.
