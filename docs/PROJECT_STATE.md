# ITM@15 Project State

_Last updated: 2026-09-13, full audit session (per `docs/ITM15_PROJECT_AUDIT_AND_PENDING_CONTROL.md`)._

## Full audit completed 2026-09-13

Ran the audit-control doc's full procedure (§7): re-verified every previously-`[x]` checklist item against current code/git/a fresh `pnpm verify` (none needed reopening — no regressions found), rebuilt `docs/PROJECT_AUDIT_CHECKLIST.md` from a seed into a full backlog covering every Product Guide phase (0-21) and every WALLY.md checklist section, added a Requirement Traceability Matrix, and fixed a real doc-drift issue found along the way: `CLAUDE.md` still claimed pnpm/corepack "not yet installed" and `pnpm verify` "does not exist yet" — both false since early in this project. See `docs/PROJECT_AUDIT_CHECKLIST.md` for the complete backlog; this file stays the high-level narrative.

Per the audit's priority engine (blockers → security → foundation → dependencies → current phase → polish), with both real blockers (Supabase access, CI push) needing the user and nothing broken or failing, this session's "next smallest safe item" was creating the 6 required project agents (`.claude/agents/architecture-reviewer.md`, `security-reviewer.md`, `database-reviewer.md`, `test-reviewer.md`, `ux-reviewer.md`, `wally-reviewer.md`) — zero-risk, explicitly required by the runbook since the start, untouched all session. Each is scoped to this actual codebase's real patterns and history (e.g. `ux-reviewer` references the two real bugs this session's screenshot-driven QA caught) rather than generic boilerplate.

## Current phase

**Phase 0 — done except one push blocked on the user.** Next.js + TypeScript + Tailwind app exists, `pnpm verify` (lint+typecheck+test+build) passes clean, Vercel is linked/Git-connected/**deployed** (https://itm-15.vercel.app, HTTP 200), `.claude/settings.json` (scoped permissions + destructive-command `PreToolUse` hook) exists. Only `.github/workflows/ci.yml` remains unpushed — blocked on a `gh` OAuth scope, needs the user (see blocker 8).

**Phase 1 (Supabase foundation) — COMPLETE, verified 2026-09-13.** See the full write-up further down this file. Database rebuilds cleanly from migrations; RLS genuinely blocks anonymous access (tested with a real inserted-and-deleted row, not just an empty table); typed Supabase clients wired in; `pnpm verify` clean.

**Phase 2 (Invite-only authentication) — COMPLETE, verified live end-to-end 2026-09-13.** Product Guide §5, §26 Phase 2. Full write-up below ("Phase 2 — Invite-only authentication").

**Phase 3 (Landing page and onboarding) — COMPLETE, verified live end-to-end 2026-09-13.** Product Guide §5.4, §26 Phase 3. Full write-up below ("Phase 3 — Onboarding").

**Phase 1 (Supabase foundation) — COMPLETE, verified 2026-09-13.** The migration blocker described below is resolved: a fresh session picked up the project-scoped `mcp__supabase__*` tools immediately (confirmed via `ToolSearch`), and both draft migrations were applied to the live `ysjjgzakswaohmnaowmv` project.

**What was done, in order, this session:**
1. Applied `init_foundation` (`countries`, `entities`, `campaigns`, `profiles`, `user_roles`, `audit_logs` — content matches the committed `supabase/migrations/20260912230000_init_foundation.sql`) — remote version `20260913063933`.
2. Applied `wally_w0_tables` (`wally_dialogues`, `wally_assets`, `wally_skins`, `wally_events`, `wally_event_receipts` — content matches `supabase/migrations/20260913000000_wally_w0_tables.sql`) — remote version `20260913063956`.
3. Ran `get_advisors(security)` — one real finding: `public.set_updated_at` had a mutable `search_path` (search_path-hijacking risk). Fixed with a new migration, `supabase/migrations/20260913064034_fix_set_updated_at_search_path.sql` (`alter function ... set search_path = ''`). Re-ran the advisor: clean except the expected `audit_logs` "RLS enabled, no policy" INFO — that's the intentional deny-all-to-clients design documented inline in the migration, not an oversight.
4. Ran `get_advisors(performance)` — one real finding: `wally_dialogues.created_by` and `wally_events.created_by` (both FKs to `auth.users`) were missed in the original FK-indexing pass. Fixed with `supabase/migrations/20260913064438_add_missing_created_by_fk_indexes.sql`. Re-ran: clean except 13 "unused index" INFO findings, which are expected and not actionable — every table is brand new and empty, so no index has been exercised by a real query yet.
5. **Verified both Phase 1 acceptance criteria for real, not just structurally:**
   - *Database rebuilds from migrations*: all 4 migrations applied cleanly in sequence with zero errors; `list_tables` confirms all 11 tables exist with the expected columns/FKs/RLS flags.
   - *Anonymous browser cannot read private player data*: tested with the actual anon publishable key against the live REST API (`curl` with `apikey`/`Authorization: Bearer <anon key>`), not just inspection of the RLS flag. For `profiles`/`user_roles`/`audit_logs`/`wally_event_receipts`, initial requests all returned `200 []` — but the tables were empty, which would also produce `200 []` even if RLS were broken. To rule that out, inserted a real row into `audit_logs` via the service-role migration path (`action: 'phase1_verification_test'`), re-ran the anon-key `curl` request, confirmed it still returned `[]` (the row was invisible to anon despite genuinely existing), then deleted the test row. This proves RLS is actually filtering, not just that the tables happen to be empty. The three `auth.uid()`-based "own row" policies (`profiles`, `user_roles`, `wally_event_receipts`) use the identical, standard Supabase pattern (`col = (select auth.uid())`, which evaluates to `NULL = x` → always false with no JWT) — deliberately did not fabricate a synthetic `auth.users` row via raw SQL to test these further, since hand-inserting into Supabase's managed `auth` schema is exactly the kind of risky workaround the runbook warns against. The real per-row test for those three tables (one player can't read another's profile) is naturally covered once Phase 2 creates actual accounts — the earliest point "another player's private data" meaningfully exists to leak.
6. Generated real TypeScript types via `mcp__supabase__generate_typescript_types` against the live schema → `src/lib/supabase/database.types.ts`. Wired the `Database` generic into all three existing clients (`client.ts`'s `createBrowserClient<Database>`, `server.ts`'s `createServerClient<Database>`, `admin.ts`'s `createClient<Database>`) — `pnpm verify` passes clean with the typed clients.

**Known pre-existing filename/version mismatch, not introduced this session**: `supabase/migrations/20260912230000_init_foundation.sql` and `20260913000000_wally_w0_tables.sql` were already committed under those filenames before this session, but Supabase's `apply_migration` assigns its own timestamp-based version at apply time (`20260913063933`/`20260913063956`), independent of the filename. The two new migrations added this session use their real applied versions as filenames. This mismatch is cosmetic (migration *content* matches exactly, confirmed by diffing what was applied against the committed files) but could confuse a future `supabase db push`/CLI-based workflow reconciliation — worth a rename-for-consistency pass later if the Supabase CLI ever needs to manage this project's migrations directly.

Earlier context from when this was blocked, kept for history:

The user supplied a live Supabase project (`ysjjgzakswaohmnaowmv`) with its URL and keys. This session:
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

**Root cause of the MCP blocker finally identified precisely (2026-09-13) — this is not an OAuth/account problem:**

```
$ claude mcp login supabase
"supabase" is from .mcp.json and awaiting approval. Run `claude` in this directory to review it first.

$ claude mcp list
...
supabase: https://mcp.supabase.com/mcp?project_ref=ysjjgzakswaohmnaowmv&... (HTTP) - ⏸ Pending approval (run `claude` to approve)
vercel / playwright / memory: also ⏸ Pending approval
```

All four project-scoped `.mcp.json` servers sit behind a one-time **trust-on-first-use approval gate** — a security feature specific to project-committed MCP servers (anyone who can edit the repo could add one, so Claude Code requires explicit human review before ever connecting, separate from OAuth). This gate can only be cleared by running the **interactive** `claude` REPL in this directory — confirmed directly: no CLI subcommand (`claude mcp login`, `claude mcp add`, etc.) can approve it. This background session cannot clear it itself, and `claude /mcp` run inside a session that already has the gate pending doesn't clear it either — approval is a prompt shown when `claude` itself starts up in this directory.

**RESOLVED by the user (2026-09-13) — confirmed via `claude mcp list`:**
```
supabase: https://mcp.supabase.com/mcp?project_ref=ysjjgzakswaohmnaowmv&... (HTTP) - ✔ Connected
vercel / playwright / memory: also ✔ Connected
```
The approval + OAuth steps worked. **However, this specific long-running session (a background job) cannot pick up the newly-approved connection** — its tool bindings were fixed at session start, and `ToolSearch` confirms no `mcp__supabase__*` tools exist here despite the CLI-level config showing connected. The account-level `mcp__claude_ai_Supabase__*` tools (a separate, older connector) are unaffected and still only see the unrelated `soko-ai` project.

**Re-confirmed in a later session (2026-09-13, different background job, `cwd` already `~/ITM-15`):** `claude mcp list` shows the project-scoped `supabase` server (`project_ref=ysjjgzakswaohmnaowmv`) as **✔ Connected**, same as `vercel`/`playwright`/`memory`. But `ToolSearch` for `mcp__supabase__*` still finds nothing in this session — confirming the diagnosis above generalizes to *any* session whose tool bindings were fixed before the connection came up, not just the specific background job that first hit it. The account-level `mcp__claude_ai_Supabase__*` connector was re-checked too (`list_projects`): still only sees `soko-ai`. **This remains unresolved — it needs an actually-new session, not a continuation of an existing one, however long that existing session has been open or however many times its `cwd` has changed underneath it.**

**Next session (fresh background job or interactive `claude` in `~/ITM-15`) should, as its first action:**
1. Verify via `ToolSearch` for `mcp__supabase__*` (or whatever prefix a fresh session assigns the project's `.mcp.json` `supabase` server) — this should now work immediately, no more approval dance needed.
2. Get the project ID for `ysjjgzakswaohmnaowmv` (via `list_projects` or `get_project`) and apply both draft migrations: `supabase/migrations/20260912230000_init_foundation.sql` and `supabase/migrations/20260913000000_wally_w0_tables.sql` (via `apply_migration`, in that order — the Wally migration references `campaigns` from the foundation one).
3. Verify the two Phase 1 acceptance criteria: database rebuilds cleanly, anonymous client can't read `profiles`/`user_roles`/`audit_logs`/`wally_event_receipts`.
4. Run `get_advisors` (security + performance) after applying — the Supabase MCP server explicitly recommends this after any DDL change.
5. Generate TypeScript types (`supabase gen types typescript` or the MCP equivalent) and wire `src/lib/supabase/*` up for real use.
6. Update this file, `docs/QUALITY_STATUS.md`, and `docs/PROJECT_AUDIT_CHECKLIST.md` from "drafted, unapplied" to verified, with the real evidence (commit SHA, advisor output, acceptance-criteria proof) — not before.

**Prisma remains separately blocked** — `DATABASE_URL`/`DIRECT_URL` still need the real database password; the MCP route above doesn't hand Prisma a raw Postgres connection string even once approved.

**Progress made without needing either blocker (2026-09-13):** all 7 Supabase-related env vars added to Vercel's **Production** environment (encrypted, confirmed via `vercel env ls`) — read from `.env.local` via shell variable substitution, never printed in any command text or tool output. **Preview environment hit an apparent Vercel CLI v54.2.0 bug**: `vercel env add <name> preview --value <value> --yes` (the CLI's own suggested fix) fails identically even for a disposable test variable with no real value — not specific to these variables. Fix later via `npm i -g vercel@latest` (v59.10.0 available) or the dashboard.

~~Phase 1 is **not complete** until the migration is actually applied and its two acceptance criteria are verified (database rebuilds from migrations; anonymous browser can't read private data).~~ **Superseded — see the "COMPLETE, verified 2026-09-13" block above.**

## Phase 2 — Invite-only authentication (Product Guide §5, §26 Phase 2)

Built and verified live against the real `ysjjgzakswaohmnaowmv` database (no mocks, no fake demo state — every check below is a real HTTP request/response against the running app and real Supabase Auth).

**Scope delivered:**
- `/login` — email/password sign-in against Supabase Auth. No self-registration path exists anywhere in the app; this is the only way in.
- `/first-login` — forced password-change screen, reachable only while `must_change_password = true`. Changes the real Supabase Auth password (`auth.updateUser`) then flips `must_change_password` via the service-role admin client (no client-writable path exists to flip that flag without an actual password change — see the migration's own comment on `profiles`).
- `/admin/players/new` — Super-Admin-only "Add Player" form (Product Guide §5.1/§28.1). Creates the Supabase Auth user server-side with the temporary `Walumo` password, writes `profiles` + `user_roles` + an `audit_logs` row in one action, and rolls back (deletes the orphaned auth user) if any later write fails.
- `/admin/players` — Super-Admin-only user list with inline role/status editing (Product Guide §4.5 "user administration, permission management" + §27's `/admin/players` route). Editing your own row is blocked both in the UI (no form rendered) and server-side (the action rejects it) — a deliberate self-lockout guard, since alexander.gichangi@walumoafrica.com is currently the only Super Admin.
- `src/proxy.ts` — the actual security gate (Next.js 16 renamed "middleware" to "proxy" — see the extensive header comment in that file for a real gotcha this cost real time to find). Redirects unauthenticated visitors away from protected routes, force-redirects `must_change_password = true` accounts to `/first-login` on **every** request (not just at login), signs out and rejects `DISABLED` accounts on **every** request, and blocks non-admin roles from `/admin/*`.
- `/play` and `/admin` — honest, labeled placeholder landing pages (real signed-in profile data, explicitly say the real Phase 4/5 UI isn't built yet) — they exist only to give the auth flow a genuine destination, per the Storyline Build Bible's "no fake demo" rule.
- Sign-out (not itemized in Product Guide §5, but a basic necessity — added for real use).

**Corrected a spec-alignment issue found while implementing this**: Product Guide §4.5 assigns "user administration, permission management" to Super Admin specifically; §4.4's Game Master capability list doesn't include it. The account-creation authorization was initially written as GAME_MASTER-or-SUPER_ADMIN (over-permissioned); tightened to SUPER_ADMIN-only for both creating accounts and changing roles/status, matching the spec precisely.

**A real Super Admin now exists in the live database**: `alexander.gichangi@walumoafrica.com`, per the user's explicit instruction ("he is the only one who can upgrade someone's status as an admin in the system"). Not a synthetic placeholder — this is the account the user will actually use. Its current password is `SuperAdminRealPassw0rd!` (set during live verification, disclosed here since it's the user's own account) — **the user should change this via `/first-login` won't re-trigger since must_change_password is already false; there's no self-service "change my password" page yet outside the forced first-login gate, so changing it further requires either a future profile-settings page (not yet built) or a direct admin-API password reset**. Flagging this rather than leaving it undisclosed.

**Two real bugs found and fixed via live testing, not just `pnpm verify`:**
1. **Next.js 16 middleware/proxy rename.** A file named `middleware.ts` (the pre-16 convention) compiles cleanly, typechecks, and even appears as `ƒ Proxy (Middleware)` in `next build` output — but is silently never invoked at runtime in this version. The exported function must be named `proxy`, not `middleware`, and — specific to this project's `src/app/` layout — the file must live at `src/proxy.ts`, not root-level `proxy.ts` (a root-level file also compiles and bundles but never gets registered). Found via a short-circuit probe route (`/__proxy_probe`) after `pnpm verify` gave zero signal that anything was wrong. Documented at length in `src/proxy.ts`'s own header comment so a future session doesn't lose the same time rediscovering it.
2. **`FormData.get()` returns `null`, not `undefined`, for a field that isn't in the form at all** (as opposed to `""` for an empty-but-present field). `createEmployeeSchema`'s `entityId`/`countryId`/`fullName` fields used `.optional().or(z.literal(""))`, which accepts `undefined` or `""` but not `null` — so submitting the "Add Player" form (which has no `entityId` field at all) always failed with a generic "Invalid input" error. Fixed with a small `optionalFormField()` helper in `src/lib/auth/schemas.ts` that normalizes `null`/`""` to `undefined` before validation, so future fields built the same way don't repeat this. Regression tests added.

**Also found and fixed, separate from the above**: a real (if non-security) Next.js dev-mode (Turbopack) quirk where a Server Action's `redirect()` target, if itself redirected again by `proxy.ts`, renders the *correct* final content but the browser's address bar doesn't reliably sync to match (confirmed: content is always correct, and any real subsequent navigation — reload, back — immediately shows the true URL, so this never bypassed the security gate). Fixed properly rather than worked around: `signIn` and `changePassword` now compute their own correct destination (checking `must_change_password` and role) instead of always redirecting to one fixed route and relying on `proxy.ts` to correct it on the next request — this removes the double-redirect entirely in the common case, and incidentally makes the code less dependent on the "middleware fixes up a wrong guess" pattern.

**Verified live, end-to-end, against the real database** (Playwright, headless Chromium, synthetic accounts only per runbook §41 — `amina.kenya@itm15.test` "Amina Kenya" and `jean.disabled@itm15.test`, both deleted after verification):
- Unknown email cannot sign in (`Incorrect email or password.`) — no self-registration path exists to even attempt.
- Super Admin logs in with the temporary `Walumo` password → forced to `/first-login` (real HTTP-level check, not just UI state).
- Password change → lands on `/admin` (role-aware default destination).
- Admin creates a real player account via the real form → real `auth.users`/`profiles`/`user_roles`/`audit_logs` rows.
- Duplicate email correctly rejected (`An account with this email already exists.`).
- New user genuinely appears in the live `/admin/players` list (service-role read, not RLS-scoped — a Super Admin needs to see everyone).
- Sign-out works.
- New player logs in with `Walumo` → forced to `/first-login` (same real gate, different account, confirms it's not admin-specific).
- Player changes password → lands on `/play`, **not** `/admin` (role-aware default correctly distinguishes PLAYER from SUPER_ADMIN).
- Player cannot reach `/admin` — redirected to `/play`.
- **Disabled-account rejection** (Product Guide §5.2 step 3): Super Admin disables a player via `/admin/players` → that player's next login attempt is rejected (`This account is not able to sign in.`) even with the correct password.

All test/throwaway accounts and their `audit_logs`/`profiles`/`user_roles` rows were deleted after verification — the live database now contains exactly one real account (the Super Admin) and no test data, consistent with the same "verify then clean" pattern used in Phase 1.

**Security review**: dispatched to the `security-reviewer` subagent (isolated context). **Verdict: PASS** — no critical finding (no uninvited-user entry path, no player→admin authorization bypass, no cross-user data leak, no way to clear `must_change_password` without an actual password change, no missing audit log on a high-impact action). One real **Medium**-severity finding, fixed before this write-up:

**Finding: `src/proxy.ts`'s redirect branches dropped Supabase cookie mutations.** Every redirect built a bare `NextResponse.redirect(url)` instead of the response `createMiddlewareClient`'s cookie-mutation callback actually wrote to — so a token refresh, and critically `auth.signOut()`'s cookie-clearing in the `DISABLED`/no-profile branches, never reached the browser. Not an authorization bypass (`getUser()` still revalidates server-side on the next request regardless), but a real session-hygiene defect: a disabled/signed-out user's stale session cookie could linger in the browser. **Fixed** with a `redirectWithCookies()` helper that copies the mutated response's cookies onto the redirect, applied to all 7 redirect branches. **Verified the fix actually works**, not just that it compiles: logged in as a real test account, disabled it externally mid-session, confirmed the auth cookie was present before hitting a protected route and genuinely absent afterward (previously it would have remained, stale). Test account deleted after verification.

**No new migrations were needed** — `profiles`, `user_roles`, and `audit_logs` (from the Phase 1 foundation migration) already had everything Phase 2 needed, including the RLS policies (`profiles`/`user_roles`'s "own row" read policies, and the deliberate absence of any client-writable policy on either — every write in this phase goes through the service-role admin client from a server action, exactly the pattern the migration's own comments describe).

`pnpm verify` (lint/typecheck/43 unit tests/build) passes clean throughout.

## Phase 3 — Onboarding (Product Guide §5.4, §26 Phase 3)

Built and verified live against the real `ysjjgzakswaohmnaowmv` database.

**Scope delivered:**
- `/onboarding` — captures the minimum required game identity per §5.4: full name, country (required), entity/company (recommended, shown once a country is picked, filtered to that country's entities). Email is never re-collected — it's already known from Auth.
- `src/app/onboarding/actions.ts` (`completeOnboarding`) — writes through the service-role admin client (same reason as every other `profiles` write: no client-writable UPDATE policy exists), sets `full_name`, derives and sets `first_name` (new `src/lib/auth/profile.ts::deriveFirstName` — first whitespace-separated token of the full name; WALLY.md §18.2's dialogue variables use `{{first_name}}` specifically, not the full name), `country_id`, `entity_id`, and flips `onboarding_completed` to `true`.
- `src/proxy.ts` — extended with a new gate: an authenticated user with `onboarding_completed = false` is redirected to `/onboarding` on every request (except `/first-login`, which still takes priority), regardless of role. This matches Product Guide §5.2's login-behavior order literally ("if must_change_password, go to /first-login... if required profile fields are incomplete, go to /onboarding... otherwise route by role") — no role-based exemption exists in the spec, so none was added: an admin account still needs a real name/country on file.
- Landing page (`src/app/page.tsx`): added the Product Guide §6.1 "Enter the Game" primary CTA (→ `/login`), now that Phase 2 gives it a real destination instead of a dead link. "Sign In" isn't a separate control — this product is invite-only with a single entry point, so both spec CTAs resolve to the same page.

**Squad auto-assignment** ("assign the player to an eligible squad if automatic squad assignment is enabled," §5.4) was **not** attempted — `squads`/`squad_members` don't exist yet (later than the Phase 1 foundation schema). Revisit once those tables exist.

**A real bug caught by live testing, not `pnpm verify`:** `src/app/login/actions.ts`'s `signIn` and `src/app/first-login/actions.ts`'s `changePassword` both compute their own post-auth redirect destination directly (a deliberate pattern from Phase 2, to avoid a Next.js dev-mode double-redirect artifact — see their header comments) — but neither had been taught about the new `onboarding_completed` gate, so both sent a not-yet-onboarded user straight to `/play`/`/admin` instead of `/onboarding`. A first Playwright run of the live flow caught this immediately (`page.waitForURL("**/onboarding")` timed out; the browser had actually landed on `/play`). Fixed by extending both actions' own destination computation to check `onboarding_completed` first, mirroring exactly the check `completeOnboarding` and `src/proxy.ts` already use. Re-ran the same live test afterward — passed clean. This is the same class of bug the Phase 2 write-up already flags as something `pnpm verify` structurally cannot catch (it's a live request-routing behavior, not a type or lint issue).

**Verified live, end-to-end** (Playwright, headless Chromium, a synthetic `onboarding.test@itm15.test` account created directly via the service-role key — same "create via service role, verify, delete" pattern as Phase 2 — deleted after verification):
- Temporary-password login → `/first-login` (unchanged from Phase 2).
- Password change → `/onboarding` (not `/play` — this is the new behavior; confirms the bugfix above).
- Onboarding form renders the real seeded countries (🇧🇯 Benin, 🇧🇮 Burundi, 🇨🇩 DR Congo, 🇰🇪 Kenya, 🇸🇳 Senegal) via a live query, not fixture data.
- Submitting the form → `/play`.
- Re-visiting `/onboarding` directly after completion → bounced to `/play` (not shown again).
- An unauthenticated visitor hitting `/onboarding` directly → bounced to `/login`.

**A real, disclosed consequence for the live Super Admin account**: `alexander.gichangi@walumoafrica.com`'s profile was created the same way any employee's is (Product Guide §5.1) and has never been through onboarding — its `onboarding_completed` is `false`. **The next time that account signs in, it will be redirected to `/onboarding` before reaching Mission Control**, same as any other account, per the spec's own unconditional ordering. This is correct behavior, not a bug, but the user should know before it happens rather than being surprised by it mid-session.

`pnpm verify` (lint/typecheck/51 unit tests/build) passes clean throughout.

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

## Narrative walkthrough preview (`/preview`)

The user asked directly: "allow me to go through the full experience day 0 to 7 in one go." Built as `src/app/preview/page.tsx` / `src/components/WalkthroughPreview.tsx` / `src/content/walkthrough.ts` — a scripted, client-only slideshow through all 8 beats (Day 0 welcome/onboarding flavor, Days 1-7, final `I BELONG` reveal), using dialogue taken directly from the Build Bible's own starter lines (not fabricated), with the seven mystery letters accumulating day by day exactly as `docs/WALLY.md` §21 describes, culminating in the full reveal + closing lines from the Bible's §45 north star.

**This is explicitly labeled and structurally kept separate from the real game** — its own header reads "Preview — narrative walkthrough," it lives at a distinct route, and `src/content/walkthrough.ts` has an extensive comment explaining exactly why it must never grow into simulating scoring, accounts, or anything that reads as functional gameplay (per the Bible's own §39 "no fake demos" rule). It's a demo of tone and pacing, not a stand-in for Phases 2-13.

Verified: `pnpm verify` green (4 new tests covering slide order/content/letter sequencing), and an actual Playwright click-through of all 8 slides to the final reveal at both breakpoints, plus a mid-journey check (Day 5) confirming the letter tray correctly shows 5 of 7 letters unlocked. Screenshots sent to the user. Linked from the homepage footer ("Preview the full seven-day story →").

**Button & motion pass against Build Bible §5/§6/§34 (2026-09-13, while blocked on Supabase — see above).** The user flagged that the preview's buttons and per-day identity were flatter than the Bible specifies. Grounded against the actual sections before changing anything:
- §5 (Button & Interaction Design System): primary actions need "a subtle luminous edge, slow breathing glow while actionable, brighter halo on hover/focus, small 3D lift on hover, tactile 1-2px press movement... glow should match current Day theme." Rare/golden actions are "used sparingly... do not overuse gold."
- §34 (Theme System): each day has a distinct emotional palette (origin/warm-archival, cultural spectrum, travel/midnight, human/warm, futuristic/Walumo, electric alliance, premium/restrained gold) — "not hard-coded colors" at the product level (that's the admin-driven Phase 15 theme engine), but a reasonable fixed interpretation for this static preview.

Added `src/content/dayThemes.ts` (a `solid`/`soft`-color accent per day 0-7, `soft` pre-mixed as rgba rather than using CSS `color-mix()` for broader browser support) and three button classes in `globals.css` (`.btn-primary`, `.btn-secondary`, `.btn-golden`) implementing the breathing-glow/hover-halo/press-movement behavior from §5, all respecting `prefers-reduced-motion` (animation off, static glow retained — the game must "remain understandable without motion," not invisible). `WalkthroughPreview.tsx` sets `--btn-glow-solid`/`--btn-glow-soft` per slide's day and applies the three classes to Continue/Back/Walk-through-it-again respectively; the final reveal reuses Day 7's gold, consistent with the existing "gold marks Day 7, nothing else" rule in `globals.css`.

This is styling of the already-labeled, already-non-functional preview — no new backend dependency, no change to what the preview claims to be. Verified: `pnpm verify` green (3 new tests on `dayThemes.ts` — day coverage 0-7, valid hex/rgba format, Day 7 reuses the exact `--color-gold` hex), and Playwright screenshots at desktop across Day 0 (blue), Day 1 (amber), Day 5 (teal), Day 7 (gold), the final reveal (golden button), a hover state, and mobile with `prefers-reduced-motion: reduce` forced. Screenshots sent to the user.

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

`60e8fbb` on `main` (origin `Gichangi001/ITM-15`), pushed and deployed — Phase 1 completion. This session's Phase 2 changes (auth pages/actions, `src/proxy.ts`, `src/lib/auth/*`) are staged for commit — see "In progress."

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

Uncommitted working-tree changes, pending review/push (Phase 2):
- `src/proxy.ts` (new — the route-protection gate; see its header comment for the Next.js 16 middleware→proxy rename gotcha).
- `src/lib/supabase/middleware.ts` (new — the middleware-flavored Supabase client `proxy.ts` uses).
- `src/lib/auth/roles.ts`, `schemas.ts` (+ `.test.ts` for both), `session.ts` (new).
- `src/app/login/`, `src/app/first-login/`, `src/app/play/`, `src/app/admin/` (`page.tsx`, `players/new/`, `players/`), `src/app/logout/` (new — pages/forms/server actions).
- `docs/PROJECT_STATE.md`, `docs/QUALITY_STATUS.md`, `docs/PROJECT_AUDIT_CHECKLIST.md` (this session's updates).

No new migrations this session — Phase 2 needed nothing Phase 1's `profiles`/`user_roles`/`audit_logs` didn't already provide.

## Blockers

1. ~~Structural doc-location conflict~~ — **Resolved.**
2. ~~No package manager foundation~~ — **Resolved.** pnpm 12.4.1 via corepack.
3. ~~No Supabase project for ITM@15~~ — **Resolved.** The user supplied a live project (`ysjjgzakswaohmnaowmv`) directly rather than this session creating one under the capped account. Migrations applied, RLS verified — see "Phase 1 — COMPLETE" above.
4. ~~Vercel unlinked/undeployed~~ — **Resolved.** Linked, Git-connected, deployed at https://itm-15.vercel.app (had to fix a Framework Preset misconfiguration via `vercel.json` along the way).
5. ~~No project-scoped `.claude/settings.json`/hooks~~ — **Resolved this session.** See "Completed."
6. **5 of 10 project skills created**, all 6 project agents undone — deliberately deferred until there's an artifact each would review (database, tests, UI, Wally runtime, a release).
7. **Memory knowledge-graph MCP server defined in `.mcp.json` but never exercised.** Durable facts remain tracked in this file, `docs/claude/ENVIRONMENT_INVENTORY.md`, and auto-memory.
8. **`.github/workflows/ci.yml` written locally, still not pushed.** GitHub rejects the push — `gh`/git OAuth token has `gist, read:org, repo` scopes but not `workflow`. User needs to run `gh auth refresh -h github.com -s workflow` (interactive, opens a browser) once; then this one file goes up on its own.

Item 3 is the only remaining blocker that needs a substantive human decision (Phase 1 cannot proceed without it). Item 8 needs one quick interactive auth step. Nothing here is security-critical in the sense of live exposure — no deployed code depends on unapplied SQL, and the destructive-command hook + scoped permissions are now active as a safety net for what comes next.

## Current architecture decisions

- **Profiles are read via RLS-scoped client, written only via server actions with the service role.** No client-writable INSERT/UPDATE policy exists on `public.profiles` — documented inline in the migration. Rationale: a broad "users can update own profile" policy would let a player flip `must_change_password` to `false` via a direct REST call without actually changing their password, or edit `country_id` post-onboarding. Revisit only via an ADR if a legitimate need for direct client writes emerges.
- **Account creation and role/status management are both Super-Admin-only** (Product Guide §4.5 "user administration, permission management" — not shared with Game Master, whose §4.4 capability list doesn't include it). Enforced three times independently: `src/proxy.ts`'s coarse `/admin/*` gate, each server action's own `getCurrentRoles()` re-check, and the page component's own redirect — deliberately belt-and-braces for the highest-privilege actions in the app.
- **Server actions compute their own post-auth redirect destination** rather than always redirecting to one fixed route and relying on `src/proxy.ts` to correct it — see the Phase 2 write-up above for the Next.js dev-mode client-router desync this fixes.
- No other decisions deviate from the Product Guide/runbook's prescribed stack. No `docs/adr/` entries needed yet for that reason.

## Next smallest complete slice

Phase 2 is done. The next smallest complete slice is the start of **Phase 3 — Landing page and onboarding** (Product Guide §6/§26 Phase 3), specifically the parts not already pulled forward by the Storyline Build Bible work:
1. `/onboarding` — capture name/country/entity for a signed-in player whose profile isn't complete yet (`profiles.onboarding_completed`). Note: `src/proxy.ts` deliberately does not gate on `onboarding_completed` yet (see its comments) — wiring that gate in is part of this slice, once the destination page actually exists.
2. Wire the real landing page's "Enter the Game" / "Sign In" CTAs to `/login` (currently omitted — see the Landing Page section below — because they'd have been dead links before Phase 2 existed).
3. Live campaign countdown once a real campaign row's `starts_at` is meaningful.

Remaining housekeeping, not blocking Phase 3:
- `.github/workflows/ci.yml` still unpushed — still needs `gh auth refresh -h github.com -s workflow` (interactive, needs the user).
- `shadcn/ui` init still deferred — Phase 2's forms were built with the project's existing custom design tokens (`.btn-primary`/`.btn-secondary`, Fraunces/Jakarta) for visual consistency with the landing page, rather than introducing a second component vocabulary; revisit once there's enough UI surface (Phase 3 onboarding, Phase 4 player shell) to justify a real component library.
- The pre-existing migration filename/version mismatch noted in the Phase 1 section — a cosmetic cleanup, not urgent.
- **The real Super Admin's password (`SuperAdminRealPassw0rd!`, set during live Phase 2 verification) should be changed by the user to something only they know** — see the Phase 2 write-up above.

## Required verification before Phase 1 is called complete — ALL MET, 2026-09-13

- ~~`supabase db reset` (or equivalent) rebuilds the database cleanly from migrations.~~ **Met** — all 4 migrations applied cleanly in sequence against the live project via `apply_migration`.
- ~~An anonymous Supabase client cannot read `profiles`, `user_roles`, or `audit_logs`.~~ **Met, and extended to `wally_event_receipts`** — verified with the real anon key via REST, including a real-row-present test against `audit_logs` (see the Phase 1 write-up above), not just an empty-table check.
- ~~`pnpm verify` still passes with any new Supabase client code added.~~ **Met** — clean lint/typecheck/test/build with the `Database`-typed clients.
- ~~`docs/DOCS_INDEX.md`/`PROJECT_STATE.md`/`QUALITY_STATUS.md` updated to reflect verified (not drafted) state.~~ **Met** — this update.

## Required verification before Phase 2 is called complete — ALL MET, 2026-09-13

- ~~Unknown email cannot self-register.~~ **Met** — no self-registration code path exists; verified an unrecognized email is rejected at `/login`.
- ~~Admin can create player.~~ **Met** — real account created via `/admin/players/new` against the live database.
- ~~Player can login with starter password once.~~ **Met** — verified for both the seeded Super Admin and an admin-created player.
- ~~Player must create private password before entering game.~~ **Met** — `must_change_password` gate verified server-side (`src/proxy.ts`) on every request, not just at login.
- ~~Admin routes reject normal players.~~ **Met** — a PLAYER-role account is redirected away from `/admin` back to `/play`.
- Disabled accounts cannot sign in (Product Guide §5.2 step 3, not a Phase-2-numbered acceptance line but explicitly required) — **Met**, verified live.
- ~~`pnpm verify` passes with the new auth code.~~ **Met.**
