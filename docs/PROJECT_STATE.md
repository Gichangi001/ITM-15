# ITM@15 Project State

_Last updated: 2026-09-12, foundation session (docs relocation, CLAUDE.md, README, project skills, MCP servers). Still no application code written._

## Current phase

**Pre-Phase 0, foundation in progress.** Documentation is now correctly placed (`docs/PRODUCT_GUIDE.md`, `docs/WALLY.md`), `CLAUDE.md` and `README.md` exist, project skills and MCP servers are configured. Still missing before Phase 0 itself can start: `package.json`/Next.js app, CI, pnpm/corepack, and an actual Supabase project for ITM@15. A Vercel project (`itm-15`) already exists but is empty and not yet linked to this repo.

## Last verified commit

`011d959` on `main` (origin `Gichangi001/ITM-15`) as of session start. This session's changes (doc relocation, `CLAUDE.md`, `README.md`, `.claude/skills/`, `.mcp.json`, `.gitignore`) are pending commit — see "In progress."

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
- `git mv` of the product guide → `docs/PRODUCT_GUIDE.md` (+ `.docx`) and `WALLY.md` → `docs/WALLY.md` (history preserved).
- New `CLAUDE.md`, rewritten `README.md`.
- New `.claude/skills/`: `project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`.
- New `.mcp.json` (project-scoped, no secrets): `vercel` (HTTP, `mcp.vercel.com`), `supabase` (HTTP, `mcp.supabase.com`), `playwright` (stdio, `npx @playwright/mcp@latest`), `memory` (stdio, `@modelcontextprotocol/server-memory`, local file `.claude-memory/itm15-memory.jsonl`).
- New `.gitignore` (`.claude-memory/`, `.tmp/`, `node_modules/`, `.next/`, `.env*`, `.vercel`, etc.).
- GitHub plugin (`github@claude-plugins-official`) installed at user scope.
- `docs/adr/` directory created, currently empty.

## Blockers

1. ~~Structural doc-location conflict~~ — **Resolved this session.** `docs/PRODUCT_GUIDE.md` and `docs/WALLY.md` now exist at their required paths; `CLAUDE.md` exists.
2. **No package manager foundation.** Corepack is not present under Node v26 (Node dropped the bundled binary); pnpm is not installed. The runbook mandates pnpm. Needs `npm install -g corepack && corepack enable` (or a direct pnpm install) before `pnpm install` can be run for the first time. **Still open.**
3. **No Supabase project for ITM@15 — contradicts an earlier claim that Supabase was "fully set up."** Re-checked this session via the Supabase connector: the only organization visible is "Soko ai" (`nggtpbegxqnxjnyhpeix`), and the only project in it is the unrelated `soko-ai` app. No ITM@15/Walumo Supabase project exists under this account. Either it was set up under a different Supabase account not connected to this session, or it has not actually been created yet. **Needs user confirmation before proceeding** — creating a new Supabase project is a billable action requiring an explicit org choice and cost confirmation, so it was not done automatically.
4. **Vercel project exists but is empty and unlinked.** `itm-15` (`prj_NGrGE4LBFHh3eSx1JoXXkmqUpXRs`) exists under `alexanderworkforceafrica-9452's projects`, created 2026-09-12, Framework Preset "Other" (nothing deployed — `https://itm-15.vercel.app` returns `404 NOT_FOUND`). This local repo is **not** `vercel link`-ed to it, and it does not appear to be Git-connected to `Gichangi001/ITM-15` yet. Linking + connecting Git is straightforward once confirmed as the intended project (four projects exist in this Vercel account: `itm-15`, `soko-ai`, `itm-green-mobility`, `frontend` — confirming `itm-15` is the right one before linking, since linking is easy to do but mildly annoying to unlink cleanly).
5. **No project-scoped `.claude/settings.json` permissions/hooks.** ITM@15 still inherits an unrelated global allow-list; the runbook's destructive-command guard hook and secret-scan hook do not exist yet. **Still open** — deliberately not created yet since it requires deciding an ITM@15-specific allow-list, not just copying the runbook's example.
6. **5 of 10 required project skills created** (`project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`). The other 5 (`supabase-review`, `test-gate`, `visual-qa`, `wally-qa`, `release-gate`) are deliberately deferred — each reviews an artifact (database, tests, UI, Wally behaviour, release) that doesn't exist yet; creating them now would just be unusable boilerplate. Add each when its Phase starts. **No project agents created yet** (`architecture-reviewer`, `security-reviewer`, `database-reviewer`, `test-reviewer`, `ux-reviewer`, `wally-reviewer`) — not requested this session; same reasoning applies.
7. **No memory knowledge-graph MCP server connected yet**, despite being defined in `.mcp.json` (`memory` entry uses local stdio + `npx`, no auth needed — should connect on next `/mcp` check or first invocation; not exercised this session). Durable facts remain tracked in this file, `docs/claude/ENVIRONMENT_INVENTORY.md`, and auto-memory in the meantime.

Item 2 must be resolved before Phase 0's application scaffolding can begin. Items 3–4 need a user decision before proceeding (see "Next smallest complete slice"). None of these are security-critical yet — no code or data exists to be insecure — so none trigger the runbook's §44 stop conditions.

## Current architecture decisions

None made yet beyond what the Product Guide/runbook already prescribe (Next.js + TypeScript + Tailwind/shadcn, Supabase Postgres/Auth/Realtime/Storage, Resend, Vercel, pnpm). No ADRs exist yet (`docs/adr/` not created) because no decision has deviated from or extended the written specs.

## Next smallest complete slice

This session's slice (docs foundation + skills + MCP + README) is ready to commit and push:

```
git add -A
git commit -m "docs(foundation): relocate product guide and Wally spec to docs/, add CLAUDE.md, README, project skills and MCP servers"
git push
```

After that, in order, each its own commit/verification pass:

1. **Confirm intent, then act** on the two open decisions:
   - Is `itm-15` (existing, empty Vercel project) the correct production target? If yes: `vercel link` this repo to it, then connect it to `Gichangi001/ITM-15` for auto-deploy on push.
   - Where should the ITM@15 Supabase project be created (organization, region)? No Supabase project can be created without this, and it's a billable action requiring explicit confirmation.
2. Install corepack/pnpm (`npm install -g corepack && corepack enable`), scaffold Next.js + TypeScript + Tailwind/shadcn, add `.env.example`, package scripts (`lint`/`typecheck`/`test`/`build`/`verify`), and a minimal CI workflow. This is Phase 0's actual application-scaffolding work — the first application code in the repo.
3. Create the Supabase project (once confirmed) and the first migration set (profiles/countries/entities/roles/campaigns/audit) with RLS from the start — Phase 1.

None of this (application scaffolding, Supabase project creation, Vercel linking) has been done yet — this session stopped at the foundation/config layer pending the two confirmations above.

## Required verification before next phase

Before Phase 0 can be declared complete (not before this slice):
- `pnpm verify` (lint + typecheck + test + build) passes.
- A clean Vercel Preview deployment succeeds.
- No secrets are committed (`.env.example` only, real values stay local/Vercel-encrypted).
- `docs/claude/DOCS_INDEX.md`/`PROJECT_STATE.md`/`QUALITY_STATUS.md` are updated to reflect the new state.
