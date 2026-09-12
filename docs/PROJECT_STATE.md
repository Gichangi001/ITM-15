# ITM@15 Project State

_Last updated: 2026-09-13, full audit session (per `docs/ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md`)._

## Full audit completed 2026-09-13

Ran the audit-control doc's full procedure (§7): re-verified every previously-`[x]` checklist item against current code/git/a fresh `pnpm verify` (none needed reopening — no regressions found), rebuilt `docs/PROJECT_AUDIT_CHECKLIST.md` from a seed into a full backlog covering every Product Guide phase (0-21) and every WALLY.md checklist section, added a Requirement Traceability Matrix, and fixed a real doc-drift issue found along the way: `CLAUDE.md` still claimed pnpm/corepack "not yet installed" and `pnpm verify` "does not exist yet" — both false since early in this project. See `docs/PROJECT_AUDIT_CHECKLIST.md` for the complete backlog; this file stays the high-level narrative.

Per the audit's priority engine (blockers → security → foundation → dependencies → current phase → polish), with both real blockers (Supabase access, CI push) needing the user and nothing broken or failing, this session's "next smallest safe item" was creating the 6 required project agents (`.claude/agents/architecture-reviewer.md`, `security-reviewer.md`, `database-reviewer.md`, `test-reviewer.md`, `ux-reviewer.md`, `wally-reviewer.md`) — zero-risk, explicitly required by the runbook since the start, untouched all session. Each is scoped to this actual codebase's real patterns and history (e.g. `ux-reviewer` references the two real bugs this session's screenshot-driven QA caught) rather than generic boilerplate.

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

## Wally placeholder assets (W0, per docs/WALLY.md §37)

The user supplied `MASCOTTE.zip` (8 pre-rendered PNGs of the Walumo brand mascot, transparent background). This session:
- Optimized all 8 with `sharp` (added as a devDependency, `pnpm-workspace.yaml`'s `allowBuilds.sharp` flipped to `true`): originals were 500KB-1.3MB PNGs up to 1536px; now 35-55KB WebP capped at 700px on the long edge. 7.3MB → 360KB total.
- Registered them in `src/wally/rendering/assets.ts` (`WALLY_POSES`), each with a tentative mapping to `docs/WALLY.md`'s event/animation vocabulary, plus a unit test (`assets.test.ts`).
- Wired the `open-arms` pose into the current homepage (`src/app/page.tsx`) — replaced the text-only placeholder with a real, on-brand visual. Verified with Playwright screenshots at mobile (390×844) and desktop (1280×800) widths — both clean; sent to the user.
- Added `supabase/migrations/20260913000000_wally_w0_tables.sql`: the five Wally tables from `docs/WALLY.md` §8 (`wally_dialogues`, `wally_events`, `wally_assets`, `wally_skins`, `wally_event_receipts`), RLS from the start, reviewed against the same best-practices skill as the foundation migration (FK indexes, `auth.uid()` wrapped in `select`). **Same caveat as the Phase 1 migration: drafted, not applied to any database.**
- Seeded the 8 images into `wally_assets` via `supabase/seed.sql`, `storage_path` pointing at the Next.js `public/wally/` path as an interim placeholder — not the Supabase Storage `wally-assets` bucket the Product Guide calls for, since that requires the same unresolved Supabase access.

## Storyline & Experience Build Bible (`docs/ITM15_STORYLINE_EXPERIENCE_BUILD_BIBLE.md`)

The user added this via GitHub web UI (`c153aed`) and asked to "implement" it. It is a ~2,300-line scene-by-scene experience-choreography spec covering the *entire* finished product: pre-login cold open, login, onboarding, all seven days in full narrative/mechanical detail, admin "live story director" controls, realtime event choreography, scoring/fairness rules, and post-event recap. It explicitly requires (§39, §45) that every feature get real backend/permissions/realtime/tests before being marked complete, and explicitly forbids "a fake demo where admin buttons only modify local React state."

**What this means for "implement it":** almost everything this document describes depends on infrastructure that doesn't exist yet — auth (Phase 2), the content/mission engine (Phase 6), scoring (Phase 8), voting (Phase 9), media (Phase 10), realtime (Phase 11), admin Mission Control (Phase 5), and the Wally behaviour engine (Phase 13) are all still Pending per `docs/PROJECT_AUDIT_CHECKLIST.md`, and Phase 1 itself (the database) is still blocked on Supabase access. Building Day 1–7 UI against that non-existent backend would be exactly the "fake demo" the document itself forbids. So this session did **not** attempt to build the seven days, admin controls, or any backend-dependent piece.

**What was genuinely implementable right now, and was built:** §8's pre-login cold open ("Scene 0" and "Scene 1") — pure front-end, no auth/database/realtime dependency. Added to `src/app/page.tsx`:
- Scene 0: a full-viewport black-screen sequence — "15 years ago…" → "It started small." → the number `8` → the context line → Wally's silhouette crossing the background (low-opacity, grayscale `dance-pose` asset) → "Enter the story" button. Staged via pure CSS `animation-delay` (`src/app/globals.css`), not JavaScript — it runs even if JS fails, and needs no hydration-mismatch handling the way a JS-timed sequence would.
- `prefers-reduced-motion` disables the delay/motion entirely (content appears immediately, per the established pattern) rather than just speeding it up.
- Scene 1 is the hero section already built for the storyline page — the Bible's Scene 1 copy ("One Dream. Many Countries…", Wally present, a "ready" CTA) already matched it; only added `id="hero"` as the Scene 0 anchor target.
- Verified with Playwright: staged reveal at multiple timestamps (t=0.5s, t=3s, t=7.5s), `prefers-reduced-motion: reduce` (shows everything immediately, confirmed), mobile (390×844), and an actual click-through of "Enter the story" confirming it scrolls correctly into Scene 1 and the rest of the page (seven-day timeline, How It Works, footer) renders undisturbed. `pnpm verify` green throughout. Screenshots sent to the user.

**Everything else in the Bible remains correctly Pending**, tracked in `docs/PROJECT_AUDIT_CHECKLIST.md` phase-by-phase as before — this document adds creative/experience detail to those phases, it doesn't change what's buildable before their backend dependencies exist.

**Reinforces an existing flagged conflict, doesn't resolve it:** the Bible independently specifies day-by-day Wally costumes (explorer Day 1, traveller Day 2, historian Day 3, etc.) in more depth than `docs/WALLY.md` §20 did. Two controlling documents now specify this; `MASCOTTE.zip`'s actual art still has none. See `docs/DOCS_INDEX.md`'s Conflicts section — this makes the case stronger that it's a real requirement needing new art or an explicit scope decision, not weaker.

## Seven-day storyline landing page (Product Guide §6, §8)

Built the public homepage into a real landing page: hero (Product Guide §6.1's exact approved copy — "One Dream. Many Countries. Thousands of People. One ITM." / "Seven days. One story. Your next mission is waiting."), the seven-day story section (§6.2's "teaser of seven locked chapters without spoiling missions" — day titles/themes from §8, teaser copy newly written to evoke purpose without describing actual mechanics), a brief "How It Works" glossary (Points/Unity Points/Squads/Passport — real terms, one line each), and an understated Walumo credit footer.

**Design:** Fraunces (display serif) + Plus Jakarta Sans (body), self-hosted via `next/font/google`. Deep-navy background with a single Walumo-blue accent and a gold accent reserved only for Day 7 ("Legacy") — a connecting vertical thread runs through all seven chapters, blue fading to gold, each day marked with a small stamp-like circle (a deliberate nod to the actual Passport/stamps game mechanic, not decorative numbering). Scroll-reveal on each chapter via a small `RevealOnScroll` client component (IntersectionObserver-based; reduced motion handled via Tailwind's `motion-reduce:` variant, not JS state, to avoid a hydration mismatch).

**Two real bugs caught and fixed before shipping**, both found by actually looking at Playwright screenshots rather than trusting the build:
1. `eslint-plugin-react-hooks`'s `set-state-in-effect` rule caught a synchronous `setState` call in `RevealOnScroll`'s effect body (from an earlier JS-computed reduced-motion check) — fixed by moving that check to a pure-CSS `motion-reduce:` variant instead.
2. The day markers rendered on top of the "Day 0X" text instead of in the timeline gutter — root cause: `RevealOnScroll`'s `translate-y-*` utility applies a non-`none` `transform`, and CSS `transform` (any value, including a zero-effect translate) creates a new containing block for absolutely-positioned descendants. The marker `<span>` was nested inside that wrapper, so `absolute left-0` was resolving against the wrapper (~40px right of where it needed to be) instead of the `<li>`. Fixed by moving the marker to be a direct sibling of the wrapper, not a child of it — documented inline as a trap for whoever adds the next absolutely-positioned element near a `RevealOnScroll`.

**Deliberately left out of this page** (would require capabilities that don't exist yet): the "15 years in motion" historical timeline and multinational-presence map (§6.2) — building these honestly needs real ITM historical facts/office data this session has no source for, and fabricating specific company history was judged too risky to invent; a live campaign countdown (§6.2) — needs a real campaign start date from the database, which doesn't exist yet; "Enter the Game"/"Sign In" CTAs (§6.1) — would be dead links until Phase 2 auth exists, so the only CTA is a working same-page scroll anchor ("Read the story ↓").

Verified with `pnpm verify` (lint/typecheck/9 unit tests/build, all passing) and Playwright screenshots at mobile (390×844) and desktop (1280×900) — captured by actually scrolling through the page in steps first, since a naive full-page screenshot only shows the hero and leaves everything else in its pre-reveal hidden state (an IntersectionObserver only fires for what a real visitor's viewport actually passes through).

**Flagged, not resolved — needs the product owner's input, not a unilateral choice on my part:** `docs/WALLY.md` §3.1/§20 describes Wally as an explorer/traveller character with day-by-day costume changes (backpack, camera, medal, hoodie, festival gear) narrating ITM's history. The actual production art in `MASCOTTE.zip` is a single, consistent Walumo-branded professional character in situational poses built around a punctuality/time theme (leaning on/sleeping against a giant clock, a STOP sign, a magnifying glass) — no costume variation, and a different thematic register than the written character bible. This registry uses the real art as-is and documents the discrepancy (see the header comment in `assets.ts`) rather than picking a side. Surface this before Phase 13 (Wally 2D behaviour prototype) actually starts building against the Day 1-7 skin system — building that against art that doesn't have day-by-day variants would be built on a guess.

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
