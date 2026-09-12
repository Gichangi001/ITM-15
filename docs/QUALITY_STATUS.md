# ITM@15 Quality Status

_Last updated: 2026-09-12, Phase 0 application-scaffolding session, on top of commit `67f425b` (uncommitted at time of writing — see `docs/PROJECT_STATE.md`)._

| Gate | Status | Notes |
|---|---|---|
| Lint | **Pass** | `pnpm lint` (`eslint`, `eslint-config-next` core-web-vitals + typescript configs) — clean. |
| Typecheck | **Pass** | `pnpm typecheck` = `next typegen && tsc --noEmit`. Next.js 16's typed routes (`LayoutProps<"/">` etc.) require `next typegen` to run once before a bare `tsc` resolves them — folded into the script so this isn't a trap for the next session. |
| Unit tests | **Pass** | `pnpm test` (Vitest) — 1 test file, 1 test (`src/lib/env.test.ts`), passing. Coverage is minimal by design: only `src/lib/env.ts` exists to test so far. |
| Integration tests | Not applicable yet | No server actions/Supabase queries exist. |
| RLS / database tests | Not applicable yet | No Supabase project exists for ITM@15 (see blocker in `PROJECT_STATE.md`). |
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

## Rule for future updates to this file

Never mark a gate green based on a prior commit after relevant code has changed. Record the exact commit SHA the result belongs to, and if a gate was skipped, say so explicitly rather than omitting the row.
