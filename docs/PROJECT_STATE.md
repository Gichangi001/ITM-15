# ITM@15 Project State

_Last updated: 2026-09-12, foundation session (docs relocation, CLAUDE.md, README, project skills, MCP servers). Still no application code written._

## Current phase

**Phase 0 — Repository and quality foundation. Nearly done.** Next.js + TypeScript + Tailwind app exists, `pnpm verify` (lint + typecheck + test + build) passes clean, Vercel project `itm-15` is linked, Git-connected, and **deployed — https://itm-15.vercel.app is live** (HTTP 200). Remaining before Phase 0 is fully done: push `.github/workflows/ci.yml` (blocked on a `gh` OAuth scope — needs the user), and a project-scoped `.claude/settings.json`. Phase 1 (Supabase/database) is separately blocked — see below.

## Last verified commit

`309efc0` on `main` (origin `Gichangi001/ITM-15`), pushed and deployed successfully.

## Completed

- Repository cloned locally to `/Users/alexandergichangi/ITM-15`.
- All three controlling specifications read in full: `ITM15_MASTER_BUILD_RUNBOOK.md`, `Walumo_ITM15_Wally_Product_Build_Guide.md` (the Product Guide), `WALLY.md`.
- Repository/git state inspected (`git status`, `log`, `remote`, `branch`).
- Environment/tooling inventory performed: Node v26.0.0, npm 11.12.1, no corepack/pnpm, git/gh authenticated, Vercel CLI authenticated (`alexanderworkforceafrica-9452`, no project linked yet), Supabase connector authenticated (only an unrelated `soko-ai` project exists — none for ITM@15 yet). Full detail in `docs/claude/ENVIRONMENT_INVENTORY.md`.
- Skills/agents/hooks/MCP/plugins/permissions/memory inventoried against this session's actual capabilities (no interactive `/skills` etc. available to this session — reconstructed from config + injected listings). Full detail in `docs/claude/ENVIRONMENT_INVENTORY.md`.
- `docs/DOCS_INDEX.md` created — indexes all 5 repo files plus the not-yet-created control files, with authority levels and one structural conflict recorded.
- `docs/QUALITY_STATUS.md` created — all gates recorded as "not applicable yet" (nothing to lint/build/test).

## In progress

Uncommitted working-tree changes, pending review/push:
- Next.js 16 + TypeScript + Tailwind app scaffolded (`create-next-app`, App Router, `src/` layout), merged into the existing repo without touching `README.md`/`CLAUDE.md`/`docs/`.
- `package.json` renamed to `itm-15`; scripts: `dev`, `build`, `start`, `lint`, `typecheck` (`next typegen && tsc --noEmit` — Next 16's typed routes need `next typegen` run once before a bare `tsc` will resolve `LayoutProps` etc.), `test` (Vitest), `test:watch`, `verify` (lint+typecheck+test+build).
- `zod` added; `src/lib/env.ts` validates `NEXT_PUBLIC_APP_URL` (optional for now — nothing server-side depends on Supabase/Resend yet, so those aren't declared as required until Phase 1 actually reads them). `src/lib/env.test.ts` covers it.
- `.env.example` added (names only).
- `vitest.config.ts` + `tests/unit/` scaffold added.
- `.github/workflows/ci.yml` added: install --frozen-lockfile, lint, typecheck, test, build on PRs and pushes to `main`.
- Homepage (`src/app/page.tsx`) and `layout.tsx` metadata replaced with an honest "under construction, Phase 0" placeholder instead of the default `create-next-app` starter content (no lorem-ipsum-equivalent left in a production-facing view, per Product Guide §2.1).
- `pnpm verify` passes clean on this working tree.
- Vercel: `vercel link` bound this directory to the existing `itm-15` project; `vercel git connect` confirmed it's **already** Git-connected to `Gichangi001/ITM-15` (was set up before this session, contrary to the earlier assumption that it wasn't linked — corrected here).
- Earlier: doc relocation (`docs/PRODUCT_GUIDE.md`, `docs/WALLY.md`), `CLAUDE.md`, `README.md`, `.claude/skills/` (5), `.mcp.json` (4 servers), `.gitignore`, GitHub plugin, `docs/adr/` — all from the previous commit `67f425b`, already pushed.

## Blockers

1. ~~Structural doc-location conflict~~ — **Resolved.** `docs/PRODUCT_GUIDE.md` and `docs/WALLY.md` at their required paths; `CLAUDE.md` exists.
2. ~~No package manager foundation~~ — **Resolved this session.** `npm install -g corepack && corepack enable` installed pnpm 12.4.1; `pnpm approve-builds esbuild` was needed once (pnpm's supply-chain policy blocks postinstall scripts by default — esbuild's is legitimate and required by Vitest).
3. **No Supabase project for ITM@15 — genuinely blocked, needs a user decision.** Attempted to create one this session (org "Soko ai", region `eu-west-3`, cost confirmed at $0/mo). Supabase rejected it: **"Gichangi001 (2 project limit)... these users will need to either delete, pause or upgrade one or more of these projects."** This account is at its free-tier project cap across *all* organizations where it's admin/owner — not just the one visible via this connector (only `soko-ai` is visible here, so a second free project exists somewhere not visible to this session, or the count includes a paused project). **Needs the user to choose:** pause/delete an existing project, upgrade a project or org to a paid plan, or use a different Supabase account — this session will not pause or delete anything on its own initiative.
4. ~~Vercel project exists but is empty and unlinked~~ — **Resolved and deployed.** `vercel link --project itm-15` bound this directory; `vercel git connect` confirmed it was already Git-connected to `Gichangi001/ITM-15`. First push (`9e6c29f`) deployed but **failed**: the project's Framework Preset was `Other` (an artifact of how it was created empty), so Vercel looked for a `public` static-output directory instead of `.next` even though `next build` itself succeeded. Fixed with a committed `vercel.json` (`{"framework": "nextjs"}`, commit `309efc0`) which overrides the dashboard setting. Redeployed successfully — **https://itm-15.vercel.app is live** (HTTP 200, serves the real placeholder page, confirmed by curl).
5. **No project-scoped `.claude/settings.json` permissions/hooks.** Still open — deliberately deferred; requires deciding an ITM@15-specific allow-list, not just copying the runbook's example.
6. **5 of 10 required project skills created** (`project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`). The other 5 and all 6 project agents remain deliberately deferred until there's an artifact each would review (database, tests, UI, Wally runtime, a release).
7. **Memory knowledge-graph MCP server defined in `.mcp.json` but still not exercised.** Durable facts remain tracked in this file, `docs/claude/ENVIRONMENT_INVENTORY.md`, and auto-memory.
8. **`.github/workflows/ci.yml` exists locally but is not committed/pushed yet.** GitHub rejected the push: the `gh`/git OAuth token only has `gist, read:org, repo` scopes, not `workflow`, which GitHub requires to create or update files under `.github/workflows/` via API/push. Needs the user to run `gh auth refresh -h github.com -s workflow` (interactive — opens a browser) once; then this one file can be committed and pushed on its own.

Item 3 is the only remaining blocker that needs a human decision before Phase 1 (database/RLS) can start. Item 8 needs one interactive auth step from the user, then is a one-line fix. Nothing above is security-critical yet — no code or data exists to be insecure — so none trigger the runbook's §44 stop conditions.

## Current architecture decisions

None made yet beyond what the Product Guide/runbook already prescribe (Next.js + TypeScript + Tailwind/shadcn, Supabase Postgres/Auth/Realtime/Storage, Resend, Vercel, pnpm). No ADRs exist yet (`docs/adr/` not created) because no decision has deviated from or extended the written specs.

## Next smallest complete slice

This session's slice (Next.js scaffold + CI + Vercel link) is ready to commit and push:

```
git add -A
git commit -m "feat(foundation): scaffold Next.js app, add CI, link Vercel project"
git push
```

Pushing to `main` will trigger a real Vercel deployment via the existing Git connection (`itm-15` project) — worth watching once pushed to confirm it actually builds and serves on Vercel's infrastructure, not just locally.

After that:

1. **Resolve the Supabase free-tier project cap (blocker 3 above)** — this needs the user, not a retry: pause/delete an existing free project, upgrade to a paid plan, or point at a different account. Nothing further on the database happens until this is decided.
2. Once unblocked, create the Supabase project, wire `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY` into Vercel env vars (never into the repo) and local `.env.local`, extend `src/lib/env.ts` to require them, and add the first migration set (profiles/countries/entities/roles/campaigns/audit_logs) with RLS from the start — Phase 1.
3. `shadcn/ui` init and Sentry placeholder config remain listed in the Product Guide's Phase 0 build list but weren't added this session (shadcn has nothing to style yet beyond the placeholder page; Sentry is explicitly deferred per the runbook to ~Phase 20). Add shadcn when Phase 3/4 UI work actually starts.

## Required verification before next phase

Before Phase 0 can be declared complete (not before this slice):
- `pnpm verify` (lint + typecheck + test + build) passes.
- A clean Vercel Preview deployment succeeds.
- No secrets are committed (`.env.example` only, real values stay local/Vercel-encrypted).
- `docs/claude/DOCS_INDEX.md`/`PROJECT_STATE.md`/`QUALITY_STATUS.md` are updated to reflect the new state.
