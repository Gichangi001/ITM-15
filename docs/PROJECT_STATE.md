# ITM@15 Project State

_Last updated: 2026-09-12, foundation + Phase 1 draft session._

## Current phase

**Phase 0 — done except one push blocked on the user.** Next.js + TypeScript + Tailwind app exists, `pnpm verify` (lint+typecheck+test+build) passes clean, Vercel is linked/Git-connected/**deployed** (https://itm-15.vercel.app, HTTP 200), `.claude/settings.json` (scoped permissions + destructive-command `PreToolUse` hook) exists. Only `.github/workflows/ci.yml` remains unpushed — blocked on a `gh` OAuth scope, needs the user (see blocker 8).

**Phase 1 (Supabase foundation) — project now exists, app-side wiring done, migration still unapplied.** The user supplied a live Supabase project (`ysjjgzakswaohmnaowmv`) with its URL and keys. This session:
- Installed `@supabase/supabase-js`, `@supabase/ssr`, `@supabase/server`, `server-only` (via `pnpm add`, not the `npm install` in the pasted instructions — this project uses pnpm per `CLAUDE.md`).
- Split env validation into `src/lib/env.ts` (client-safe: `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, now required) and `src/lib/env.server.ts` (server-only, gated by the `server-only` package: `SUPABASE_URL`/`SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY` required, `SUPABASE_JWKS_URL` optional until something reads it). Both expose a pure `parse*Env(source)` function rather than an eagerly-evaluated constant, so unit tests use synthetic fake values instead of depending on real secrets being present (works identically in CI with no secrets configured).
- Added `src/lib/supabase/client.ts` (browser, `@supabase/ssr`'s `createBrowserClient`), `server.ts` (Server Component/Action, `createServerClient` + Next's `cookies()`), `admin.ts` (service-role, bypasses RLS, `server-only`-gated).
- **Caught and fixed a real bug before it shipped**: `client.ts` initially routed `NEXT_PUBLIC_*` values through the generic `parseClientEnv(process.env)` call — Next.js only inlines `NEXT_PUBLIC_*` into the browser bundle for *direct, static* `process.env.NEXT_PUBLIC_X` expressions, not values read off a passed-through `process.env` object in another module. Fixed by referencing each var directly in `client.ts` before validating.
- Wrote real values to `.env.local` (gitignored, confirmed with `git check-ignore`) and confirmed with `grep` that the secret key does not appear anywhere in the `.next` build output.
- `.env.example` updated (names only) to include the Supabase vars plus `DATABASE_URL`/`DIRECT_URL` placeholders (see the Prisma question below).
- `.mcp.json`'s `supabase` entry rescoped to `project_ref=ysjjgzakswaohmnaowmv`.
- Installed the official Supabase agent skills (`npx skills add supabase/agent-skills` → `supabase`, `supabase-postgres-best-practices`).
- `pnpm verify` passes, including a real `next build` against `.env.local` (log line confirms: `- Environments: .env.local`).

**Still not done — needs the user:**
1. **This session's Supabase connector cannot see project `ysjjgzakswaohmnaowmv`** (only the unrelated `soko-ai` project, under a different account). To apply `supabase/migrations/20260912230000_init_foundation.sql` to the real project, either (a) the user runs `claude /mcp` interactively to authenticate the now-rescoped project MCP server against the account that owns this project, or (b) the user supplies the actual database password (both connection strings they pasted still have the `[YOUR-PASSWORD]` placeholder) so the Supabase CLI can `supabase link`/`db push` directly. Option (a) is preferred — no raw DB password needs to be typed anywhere.
2. **Prisma — flagged, not installed.** The pasted instructions include installing Prisma as an ORM with its own `prisma/schema.prisma` and migration flow. This isn't in `docs/PRODUCT_GUIDE.md`'s stack table, and would run in parallel with the `supabase/migrations/` SQL-based approach already built this session — two systems claiming schema ownership is a real architecture decision (schema drift risk, and Prisma doesn't model RLS policies natively), not a drop-in addition. Held off pending explicit confirmation — see the question asked alongside this update.

Phase 1 is **not complete** until the migration is actually applied and its two acceptance criteria are verified (database rebuilds from migrations; anonymous browser can't read private data).

## Last verified commit

`3e08875` on `main` (origin `Gichangi001/ITM-15`), pushed and deployed. This session's additions (`.claude/settings.json`, `.claude/hooks/`, `supabase/` scaffold + draft migration + seed) are staged for commit — see "In progress."

## Completed

- Repository cloned; all three controlling specs read in full.
- Environment/tooling inventoried (`docs/claude/ENVIRONMENT_INVENTORY.md`).
- `docs/PRODUCT_GUIDE.md` and `docs/WALLY.md` relocated to their required paths; `CLAUDE.md`, `README.md` written.
- 5 project skills created (`project-bootstrap`, `repo-docs-audit`, `docs-sync`, `memory-sync`, `security-gate`).
- `.mcp.json` (4 servers: vercel, supabase, playwright, memory); GitHub plugin installed.
- Next.js 16 + TypeScript + Tailwind app scaffolded; `pnpm verify` passes.
- Vercel linked, Git-connected, deployed and confirmed live via curl.
- `.claude/settings.json` (scoped permissions) + `.claude/hooks/check-destructive-command.sh` (tested directly with sample payloads — blocks `rm -rf /`, force-push, `git reset --hard`, destructive SQL; allows ordinary commands).
- `supabase init` scaffold (`supabase/config.toml`) + draft Phase 1 migration + seed data.

## In progress

Uncommitted working-tree changes, pending review/push:
- `.claude/settings.json`, `.claude/hooks/check-destructive-command.sh`.
- `supabase/config.toml`, `supabase/.gitignore`, `supabase/migrations/20260912230000_init_foundation.sql`, `supabase/seed.sql`.
- `docs/claude/ENVIRONMENT_INVENTORY.md` updates reflecting the hook/permissions additions.

## Blockers

1. ~~Structural doc-location conflict~~ — **Resolved.**
2. ~~No package manager foundation~~ — **Resolved.** pnpm 12.4.1 via corepack.
3. **No Supabase project for ITM@15 — blocks Phase 1, needs a user decision.** Creation attempted (org "Soko ai", `eu-west-3`, $0/mo confirmed) and rejected: **"Gichangi001 (2 project limit)... delete, pause or upgrade one or more of these projects."** The account is at its free-tier cap across *all* orgs where it's admin/owner — only `soko-ai` is visible via this connector, so a second free project exists somewhere not visible here. Needs the user to pause/delete/upgrade something, or point at a different account. This session will not pause or delete anything unilaterally.
4. ~~Vercel unlinked/undeployed~~ — **Resolved.** Linked, Git-connected, deployed at https://itm-15.vercel.app (had to fix a Framework Preset misconfiguration via `vercel.json` along the way).
5. ~~No project-scoped `.claude/settings.json`/hooks~~ — **Resolved this session.** See "Completed."
6. **5 of 10 project skills created**, all 6 project agents undone — deliberately deferred until there's an artifact each would review (database, tests, UI, Wally runtime, a release).
7. **Memory knowledge-graph MCP server defined in `.mcp.json` but never exercised.** Durable facts remain tracked in this file, `docs/claude/ENVIRONMENT_INVENTORY.md`, and auto-memory.
8. **`.github/workflows/ci.yml` written locally, still not pushed.** GitHub rejects the push — `gh`/git OAuth token has `gist, read:org, repo` scopes but not `workflow`. User needs to run `gh auth refresh -h github.com -s workflow` (interactive, opens a browser) once; then this one file goes up on its own.

Item 3 is the only remaining blocker that needs a substantive human decision (Phase 1 cannot proceed without it). Item 8 needs one quick interactive auth step. Nothing here is security-critical in the sense of live exposure — no deployed code depends on unapplied SQL, and the destructive-command hook + scoped permissions are now active as a safety net for what comes next.

## Current architecture decisions

- **Profiles are read via RLS-scoped client, written only via server actions with the service role.** No client-writable INSERT/UPDATE policy exists on `public.profiles` — documented inline in the migration. Rationale: a broad "users can update own profile" policy would let a player flip `must_change_password` to `false` via a direct REST call without actually changing their password, or edit `country_id` post-onboarding. Revisit only via an ADR if a legitimate need for direct client writes emerges.
- No other decisions deviate from the Product Guide/runbook's prescribed stack. No `docs/adr/` entries needed yet for that reason.

## Next smallest complete slice

1. Commit and push this session's changes (`.claude/settings.json`, hook, `supabase/` scaffold — **not** `.github/workflows/ci.yml`, still blocked).
2. **Get the two user decisions**: which Supabase project to pause/delete/upgrade (or a different account), and run `gh auth refresh -h github.com -s workflow` — then push the CI file.
3. Once Supabase is unblocked: create the project, apply `supabase/migrations/20260912230000_init_foundation.sql` (`supabase db push` or via MCP `apply_migration`), wire `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_SECRET_KEY` into Vercel env vars and local `.env.local` (never the repo), extend `src/lib/env.ts` to require them, add the Supabase client helpers (`lib/supabase/server.ts`/`client.ts`), and verify the two Phase 1 acceptance criteria before calling it done.
4. `shadcn/ui` init and Sentry config remain deferred — shadcn until there's real UI to build (Phase 3/4), Sentry per the runbook until ~Phase 20.

## Required verification before Phase 1 is called complete

- `supabase db reset` (or equivalent) rebuilds the database cleanly from migrations.
- An anonymous Supabase client cannot read `profiles`, `user_roles`, or `audit_logs`.
- `pnpm verify` still passes with any new Supabase client code added.
- `docs/DOCS_INDEX.md`/`PROJECT_STATE.md`/`QUALITY_STATUS.md` updated to reflect verified (not drafted) state.
