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

**User decisions received:** (1) authenticate the project-scoped Supabase MCP via `claude /mcp` (user will do this — interactive, needs a real terminal, I can't do it for them); (2) add Prisma — approved, added as introspection-only (see `docs/adr/0001-prisma-alongside-supabase-migrations.md`).

**Prisma added (commit after `067bfe5`):** `prisma`@7.10.0 + `@prisma/client`@7.10.0 (pinned — `prisma`'s npm `latest` tag currently resolves to an `8.0.0-rc` pre-release while `@prisma/client`'s stayed on `7.10.0`; installing both unpinned would have paired a CLI release-candidate with a stable client, so both are pinned to the matching stable `7.10.0`). `prisma/schema.prisma` has the datasource/generator blocks only — deliberately no hand-written `model` blocks; per the ADR, models come from `prisma db pull` (introspection) after a migration is actually applied, never from `prisma migrate`, since Prisma can't represent RLS policies and running two migration systems risks drift. `pnpm approve-builds` was needed again (`@prisma/engines`, `prisma`, `workerd`, `msgpackr-extract` postinstall scripts — all legitimate, part of Prisma's own toolchain).

**Migration reviewed against the installed `supabase-postgres-best-practices` skill** (2026-09-12, still before this session's uncommitted work): added FK indexes on `entities.country_id`, `profiles.country_id`/`entity_id`, `user_roles.country_id`, `audit_logs.actor_id` (Postgres doesn't auto-index foreign keys); wrapped `auth.uid()` in `select` in both RLS policies (5-10x faster per Supabase's own RLS performance guidance — otherwise the function is called per row, not once per query). UUID primary keys were reconsidered against the same skill's "prefer sequential/UUIDv7 at scale" guidance and kept as-is — Product Guide §23 explicitly mandates UUID PKs, and these are low-volume tables for a one-company, seven-day campaign, not a high-throughput multi-tenant table where that trade-off matters. Still unapplied to any real database — this review improves the draft, it doesn't unblock it.

**Still not done — needs the user:**
1. **`claude /mcp` authentication has not reached this session.** The user reported running it, but this session's project MCP config (`~/.claude.json`'s project entry) shows zero registered MCP servers, and no new Supabase tools became available — confirmed by direct inspection, twice, in the same session. Two possibilities: (a) `/mcp` was run in a different terminal/session than the one running this conversation, or (b) this session needs a full restart to pick up a project-scoped `.mcp.json` server added mid-session (likely, since `.mcp.json` didn't exist when this session started). Next step: confirm `/mcp` was run in *this* terminal window; if it was and the tools still aren't available, restart `claude` in this repo.
2. **Prisma is not yet functional** — `DATABASE_URL`/`DIRECT_URL` still need the real database password (both connection strings pasted so far kept the `[YOUR-PASSWORD]` placeholder), and `prisma db pull` can't introspect anything until the migration has actually been applied. This is a *separate* unblock from item 1 — the MCP route doesn't hand Prisma a raw Postgres connection string. If Prisma should become usable soon, the DB password needs to be supplied into `.env.local`'s `DATABASE_URL`/`DIRECT_URL`.

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
